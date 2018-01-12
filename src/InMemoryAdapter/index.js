import fs from 'fs'
import EventEmitter from 'eventemitter3'
import Immutable from 'seamless-immutable'
import { isArray, flatten, max } from 'lodash'
import pickFP from 'lodash/fp/pick'

import {
  ANY_SEQUENCE_NUMBER,
  ANY_POSITIVE_SEQUENCE_NUMBER,
} from '../GRPCServer/Implementation/AppendEventsToStream'

import zeropad from '../EventStoreNode/helpers/zeropad'

function InMemoryAdapter (config = {}) {
  let dbAdapter = new EventEmitter()
  config = { ...defaultConfig, ...config }

  let events = parseConfig(config)

  function getEventsOfStream (stream) {
    return events.filter(
      (event) =>
        event.stream.type.context === stream.type.context &&
        event.stream.type.name === stream.type.name &&
        event.stream.id === stream.id,
    )
  }
  function getEventsOfStreamType (streamType) {
    return events.filter(
      (event) =>
        event.stream.type.context === streamType.context &&
        event.stream.type.name === streamType.name,
    )
  }

  function getStreamSequenceNumber (stream) {
    let sequenceNumbers = getEventsOfStream(stream).map(
      (event) => event.sequenceNumber,
    )
    return max([0, ...sequenceNumbers])
  }

  function processAppendRequest (
    { stream, events, expectedSequenceNumber },
    actualSequenceNumber,
  ) {
    if (expectedSequenceNumber !== ANY_SEQUENCE_NUMBER) {
      if (
        actualSequenceNumber === 0 &&
        expectedSequenceNumber === ANY_POSITIVE_SEQUENCE_NUMBER
      ) {
        let error = new Error(`STREAM_DOES_NOT_EXIST`)
        error.stream = stream
        return error
      }
      if (actualSequenceNumber !== expectedSequenceNumber) {
        let error = new Error(`STREAM_SEQUENCE_MISMATCH`)
        error.stream = stream
        error.actualSequenceNumber = actualSequenceNumber
        error.expectedSequenceNumber = expectedSequenceNumber
        return error
      }
    }

    return events.map(({ type, data }, idx) => ({
      stream,
      type,
      data,
      sequenceNumber: actualSequenceNumber + idx + 1,
    }))
  }

  return Object.defineProperties(dbAdapter, {
    events: { get: () => events.slice() },
    appendEvents: {
      value: ({ appendRequests, transactionId, correlationId }) => {
        let dbResults = new EventEmitter()
        process.nextTick(() => {
          let requestsWithStreamSequenceNumber = appendRequests.map(
            (request) => ({
              request,
              streamSequenceNumber: getStreamSequenceNumber(request.stream),
            }),
          )

          let processedAppendRequests = requestsWithStreamSequenceNumber.map(
            ({ request, streamSequenceNumber }) =>
              processAppendRequest(request, streamSequenceNumber),
          )

          let errors = processedAppendRequests.filter(isError)

          if (errors.length) {
            let msg = JSON.stringify(
              errors.map(
                pickFP([
                  'message',
                  'stream',
                  'actualSequenceNumber',
                  'expectedSequenceNumber',
                ]),
              ),
            )
            process.nextTick(() => {
              dbResults.emit('error', new Error(`CONSISTENCY|${msg}`))
            })
          } else {
            let now = new Date().toISOString()
            let totalEvents = events.length
            let eventsToAppend = flatten(processedAppendRequests).map(
              (event, idx) =>
                Immutable({
                  ...event,
                  id: padId(`${totalEvents + 1 + idx}`),
                  storedOn: now,
                  transactionId: transactionId,
                  correlationId: correlationId,
                }),
            )

            events = events.concat(eventsToAppend)
            dbResults.emit('stored-events', eventsToAppend.map(toDTO))
            dbAdapter.emit('update')
          }
        })
        return dbResults
      },
      enumerable: true,
    },
    getEvents: {
      value: ({ fromEventId, limit }) => {
        fromEventId = padId(fromEventId)
        let dbResults = new EventEmitter()

        setTimeout(() => {
          let foundEvents = events.filter((event) => event.id > fromEventId)
          foundEvents = limit ? foundEvents.slice(0, limit) : foundEvents
          foundEvents.forEach((event) => dbResults.emit('event', toDTO(event)))
          dbResults.emit('end')
        }, 1)

        return dbResults
      },
      enumerable: true,
    },
    getEventsByStream: {
      value: ({ stream, fromSequenceNumber, limit }) => {
        let dbResults = new EventEmitter()

        setTimeout(() => {
          let foundEvents = getEventsOfStream(stream).filter(
            (event) => event.sequenceNumber > fromSequenceNumber,
          )
          foundEvents = limit ? foundEvents.slice(0, limit) : foundEvents
          foundEvents.forEach((event) => dbResults.emit('event', toDTO(event)))
          dbResults.emit('end')
        }, 1)

        return dbResults
      },
      enumerable: true,
    },
    getEventsByStreamType: {
      value: ({ streamType, fromEventId, limit }) => {
        fromEventId = padId(fromEventId)
        let dbResults = new EventEmitter()

        setTimeout(() => {
          let foundEvents = getEventsOfStreamType(streamType).filter(
            (event) => event.id > fromEventId,
          )
          foundEvents = limit ? foundEvents.slice(0, limit) : foundEvents
          foundEvents.forEach((event) => dbResults.emit('event', toDTO(event)))
          dbResults.emit('end')
        }, 1)

        return dbResults
      },
      enumerable: true,
    },
  })
}

const defaultConfig = {
  JSONFile: null,
}

const parseConfig = ({ JSONFile }) => {
  let events = []

  if (JSONFile) {
    let file
    try {
      file = fs.statSync(JSONFile)
      if (!file.isFile()) throw new Error()
      let fileEvents = JSON.parse(fs.readFileSync(JSONFile, 'utf8'))
      if (!isArray(fileEvents)) throw new Error()
      events = fileEvents
    } catch (e) {
      throw new TypeError(
        'config.JSONFile MUST be either falsy or a path of a json file containing a list of events',
      )
    }
  }

  return events
}

function toDTO (event) {
  return {
    ...event,
    correlationId: event.correlationId || '',
  }
}
function isError (e) {
  return e instanceof Error
}
export function padId (id) {
  return zeropad(id, 20)
}

export default InMemoryAdapter
