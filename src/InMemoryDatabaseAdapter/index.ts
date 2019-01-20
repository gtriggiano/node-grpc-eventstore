import EventEmitter from 'eventemitter3'
import { flatten, isError, pick } from 'lodash'

import { zeropad } from '../helpers/zeropad'
import {
  DatabaseAdapter,
  DbStoredEvent,
  ReadStoreForwardRequest,
  ReadStreamForwardRequest,
  ReadStreamTypeForwardRequest,
  Stream,
  StreamInsertion,
  StreamType,
} from '../types'

interface EventToStore {
  readonly name: string
  readonly payload: string
  readonly sequenceNumber: number
  readonly stream: Stream
}

const padId = (id: string | number) => zeropad(`${id}`, 25)

export const InMemoryDatabaseAdapter = (
  initialEvents: ReadonlyArray<DbStoredEvent> = []
): DatabaseAdapter => {
  const dbAdapter = new EventEmitter()

  // tslint:disable-next-line:readonly-array
  const events: DbStoredEvent[] = initialEvents.slice()

  const getEventsOfStream = (stream: Stream) =>
    events.filter(
      event =>
        event.stream.type.context === stream.type.context &&
        event.stream.type.name === stream.type.name &&
        event.stream.id === stream.id
    )

  const getEventsOfStreamType = (streamType: StreamType) =>
    events.filter(
      event =>
        event.stream.type.context === streamType.context &&
        event.stream.type.name === streamType.name
    )

  const getStreamSize = (stream: Stream) => getEventsOfStream(stream).length

  const processInsertion = (
    insertion: StreamInsertion,
    actualStreamSize: number
  ): ReadonlyArray<EventToStore> | Error => {
    const { stream, events: eventsToStore, expectedStreamSize } = insertion

    // tslint:disable-next-line:no-if-statement
    if (expectedStreamSize !== -2) {
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize === -1 && !actualStreamSize) {
        const error = new Error(`STREAM_DOES_NOT_EXIST`)
        return error
      }
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize !== actualStreamSize) {
        const error = new Error(`STREAM_SEQUENCE_MISMATCH`)
        return error
      }
    }

    return eventsToStore
      ? eventsToStore.map(({ name, payload }, idx) => ({
          name,
          payload,
          sequenceNumber: actualStreamSize + idx + 1,
          stream,
        }))
      : []
  }

  const getAllEvents = () => events.slice()
  const appendEvents = (
    insertions: ReadonlyArray<StreamInsertion>,
    transactionId: string,
    correlationId: string
  ) => {
    const dbResults: EventEmitter<
      'stored-events' | 'update' | 'error'
    > = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const processedInsertions = insertions.map(insertion =>
        processInsertion(insertion, getStreamSize(insertion.stream))
      )
      const errors = processedInsertions.filter(x => isError(x))

      // tslint:disable-next-line:no-if-statement
      if (errors.length) {
        const message = JSON.stringify(
          errors.map(error => pick(error, ['message']))
        )
        // tslint:disable-next-line:no-expression-statement
        dbResults.emit('error', new Error(`CONSISTENCY|${message}`))
      } else {
        const now = new Date().toISOString()
        const totalEvents = events.length
        const eventsToAppend: ReadonlyArray<DbStoredEvent> = flatten(
          (processedInsertions as unknown) as ReadonlyArray<EventToStore>
        ).map((event, idx) => ({
          ...event,
          correlationId,
          id: padId(totalEvents + 1 + idx),
          storedOn: now,
          transactionId,
        }))
        // tslint:disable-next-line:no-expression-statement
        dbResults.emit('stored-events', eventsToAppend)
        // tslint:disable-next-line:no-expression-statement
        dbAdapter.emit('update')
      }
    })

    return dbResults
  }
  const getEvents = ({ fromEventId, limit }: ReadStoreForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const paddedFromEventId = padId(fromEventId)
      const foundEvents = events
        .filter(({ id }) => id > paddedFromEventId)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }
  const getEventsByStream = ({
    stream,
    fromSequenceNumber,
    limit,
  }: ReadStreamForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const foundEvents = getEventsOfStream(stream)
        .filter(({ sequenceNumber }) => sequenceNumber > fromSequenceNumber)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }
  const getEventsByStreamType = ({
    streamType,
    fromEventId,
    limit,
  }: ReadStreamTypeForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const paddedFromEventId = padId(fromEventId)
      const foundEvents = getEventsOfStreamType(streamType)
        .filter(({ id }) => id > paddedFromEventId)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }

  return {
    appendEvents,
    getAllEvents,
    getEvents,
    getEventsByStream,
    getEventsByStreamType,
  }
}
