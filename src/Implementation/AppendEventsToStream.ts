// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'
import uuid from 'uuid'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidEventName } from '../helpers/isValidEventName'
import { isValidStream } from '../helpers/isValidStream'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { streamToString } from '../helpers/streamToString'
import { AppendEventsToStreamRequest, StoredEventsList } from '../proto'
import { DbError, DbStoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

export const ANY_SEQUENCE_NUMBER = -2
export const ANY_POSITIVE_SEQUENCE_NUMBER = -1

type AppendEventsToStreamFactory = (
  config: ImplementationConfiguration
) => GRPC.handleUnaryCall<AppendEventsToStreamRequest, StoredEventsList>

export const AppendEventsToStream: AppendEventsToStreamFactory = ({
  db,
  onEventsStored,
  isStreamWritable,
}) => (call, callback) => {
  const correlationId = call.request.getCorrelationId()
  const insertionMessage = call.request.getInsertion()
  const insertion = insertionMessage && insertionMessage.toObject()

  if (!insertion) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'insertion is mandatory',
        name: 'MISSING_INSERTION',
      },
      null
    )
    return
  }

  if (insertion.expectedStreamSize < -2) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `insertion.expectedStreamSize should be >= -2`,
        name: 'BAD_EXPECTED_STREAM_SIZE',
      },
      null
    )
    return
  }

  if (!isValidStream(insertion.stream)) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: JSON.stringify(insertion.stream),
        name: 'BAD_INSERTION_STREAM',
      },
      null
    )
    return
  }

  const sanitizedStream = sanitizeStream(insertion.stream)

  if (!isStreamWritable(sanitizedStream)) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: JSON.stringify(insertion.stream),
        name: 'INSERTION_STREAM_NOT_WRITABLE',
      },
      null
    )
    return
  }

  if (!insertion.eventsList.length) {
    callback(null, new StoredEventsList())
    return
  }

  const indexOfUnvalidEvent = insertion.eventsList.findIndex(
    ({ name }) => !isValidEventName(name)
  )
  if (indexOfUnvalidEvent >= 0) {
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: `event[${indexOfUnvalidEvent}] has a not valid name: "${JSON.stringify(
          insertion.eventsList[indexOfUnvalidEvent].name
        )}"`,
        name: 'EVENT_NAME_NOT_VALID',
      },
      null
    )
    return
  }

  const sanitizedInsertion = {
    events: insertion.eventsList.map(({ name, payload }) => ({
      name: name.trim(),
      payload,
    })),
    expectedStreamSize: insertion.expectedStreamSize,
    stream: sanitizedStream,
  }

  const dbResults = db.appendEvents([sanitizedInsertion], uuid(), correlationId)
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
