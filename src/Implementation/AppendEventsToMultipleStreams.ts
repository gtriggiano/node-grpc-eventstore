// tslint:disable no-expression-statement no-if-statement no-let
import * as GRPC from 'grpc'
import { uniq } from 'lodash'
import uuid from 'uuid'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidEventName } from '../helpers/isValidEventName'
import { isValidStream } from '../helpers/isValidStream'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { streamToString } from '../helpers/streamToString'
import {
  AppendEventsToMultipleStreamsRequest,
  StoredEventsList,
} from '../proto'
import { DbError, DbStoredEvent, Stream, StreamInsertion } from '../types'

import { ImplementationConfiguration } from './index'

type AppendEventsToMultipleStreamsFactory = (
  config: ImplementationConfiguration
) => GRPC.handleUnaryCall<
  AppendEventsToMultipleStreamsRequest,
  StoredEventsList
>

export const AppendEventsToMultipleStreams: AppendEventsToMultipleStreamsFactory = ({
  db,
  onEventsStored,
  isStreamWritable,
}) => (call, callback) => {
  const correlationId = call.request.getCorrelationId()
  const insertions = call.request.toObject().insertionsList

  /**
   * Check if at least one insertion was passed
   */
  if (!insertions.length) {
    callback(null, new StoredEventsList())
  }

  /**
   * Check if the passed insertions contain at least one event
   */
  if (
    !insertions.reduce<any>(
      (list, { eventsList }) => list.concat(eventsList),
      []
    ).length
  ) {
    callback(null, new StoredEventsList())
    return
  }

  /**
   * Check that all insertions specified streams are valid
   */
  const indexOfInsertionWithUnvalidStream = insertions.findIndex(
    ({ stream }) => !isValidStream(stream)
  )
  if (indexOfInsertionWithUnvalidStream >= 0) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `insertions[${indexOfInsertionWithUnvalidStream}]: ${JSON.stringify(
          insertions[indexOfInsertionWithUnvalidStream].stream
        )}`,
        name: 'BAD_INSERTION_STREAM',
      },
      null
    )
    return
  }

  /**
   * Sanitize insertions streams and map `eventsList` to `events`
   */
  const sanitizedInsertions = insertions.map<StreamInsertion>(
    ({ stream, expectedStreamSize, eventsList }) => ({
      events: eventsList,
      expectedStreamSize,
      stream: sanitizeStream(stream as Stream),
    })
  )

  /**
   * Check if multiple insertions for the same stream were passed
   */
  const namesOfStreams = sanitizedInsertions.map(({ stream }) =>
    streamToString(stream)
  )
  const haveOverlappingInsertions =
    namesOfStreams.length !== uniq(namesOfStreams).length
  if (haveOverlappingInsertions) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `overlapping insertions for the following streams: ${JSON.stringify(
          uniq(
            namesOfStreams.filter((value, i) =>
              namesOfStreams.includes(value, i + 1)
            )
          )
        )}`,
        name: 'OVERLAPPING_INSERTIONS',
      },
      null
    )
    return
  }

  /**
   * Check if expectedStreamSize is not valid for some insertion
   */
  const indexOfInsertionWithUnvalidExpectedStreamSize = insertions.findIndex(
    ({ expectedStreamSize }) => expectedStreamSize < -2
  )
  if (indexOfInsertionWithUnvalidExpectedStreamSize >= 0) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `insertions[${indexOfInsertionWithUnvalidExpectedStreamSize}].expectedStreamSize should be >= -2`,
        name: 'BAD_EXPECTED_STREAM_SIZE',
      },
      null
    )
    return
  }

  /**
   * Check if some insertion is related to an unwritable stream
   */
  const indexOfInsertionForUnwritableStream = sanitizedInsertions.findIndex(
    ({ stream }) => !isStreamWritable(stream)
  )
  if (indexOfInsertionForUnwritableStream >= 0) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `insertions[${indexOfInsertionForUnwritableStream}]: ${JSON.stringify(
          insertions[indexOfInsertionForUnwritableStream].stream
        )}`,
        name: 'INSERTION_STREAM_NOT_WRITABLE',
      },
      null
    )
    return
  }

  /**
   * Check if some insertion contains an unvalid event
   */
  const indexOfInsertionWithUnvalidEventWithEventIndex = sanitizedInsertions.reduce<
    undefined | [number, number]
  >((res, { events }, idx) => {
    if (res) return res
    const indexOfUnvalidEvent = events.findIndex(
      ({ name }) => !isValidEventName(name)
    )
    return indexOfUnvalidEvent >= 0 ? [idx, indexOfUnvalidEvent] : undefined
  }, undefined)
  if (indexOfInsertionWithUnvalidEventWithEventIndex) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `insertions[${
          indexOfInsertionWithUnvalidEventWithEventIndex[0]
        }].events[${
          indexOfInsertionWithUnvalidEventWithEventIndex[1]
        }] has a not valid name: "${JSON.stringify(
          sanitizedInsertions[indexOfInsertionWithUnvalidEventWithEventIndex[0]]
            .events[indexOfInsertionWithUnvalidEventWithEventIndex[1]].name
        )}"`,
        name: 'EVENT_NAME_NOT_VALID',
      },
      null
    )
    return
  }

  const dbResults = db.appendEvents(sanitizedInsertions, uuid(), correlationId)
  const cleanListeners = () => dbResults.removeAllListeners()

  const onDbStoredEvents = (storedEvents: ReadonlyArray<DbStoredEvent>) => {
    const storedEventsListMessage = storedEvents.reduce<StoredEventsList>(
      (message, storedEvent) => {
        message.addEvents(getStoredEventMessage(storedEvent))
        return message
      },
      new StoredEventsList()
    )

    cleanListeners()
    onEventsStored(storedEvents)
    callback(null, storedEventsListMessage)
  }

  const onDbError = (error: DbError) => {
    cleanListeners()
    switch (error.name) {
      case 'CONCURRENCY':
        const metadataMessage = new GRPC.Metadata()
        error.failures.forEach(failure => {
          metadataMessage.add(
            streamToString(failure.stream),
            JSON.stringify(failure)
          )
        })
        callback(
          {
            code: GRPC.status.ABORTED,
            message: error.message,
            metadata: metadataMessage,
            name: error.name,
          },
          null
        )
        break

      case 'UNAVAILABLE':
      default:
        callback(
          {
            code: GRPC.status.UNAVAILABLE,
            message: error.message,
            name: error.name,
          },
          null
        )
        break
    }
  }

  dbResults.on('stored-events', onDbStoredEvents)
  dbResults.on('error', onDbError)
}
