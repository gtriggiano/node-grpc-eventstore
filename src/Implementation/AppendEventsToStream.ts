// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'
import uuid from 'uuid'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidEventName } from '../helpers/isValidEventName'
import { isValidStream } from '../helpers/isValidStream'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { Messages, IEventStoreServer } from '../proto'
import { DbError, DbStoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

export const ANY_SEQUENCE_NUMBER = -2
export const ANY_POSITIVE_SEQUENCE_NUMBER = -1

type AppendEventsToStreamFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['appendEventsToStream']

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
        message: 'MISSING_INSERTION',
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
        message: 'INVALID_EXPECTED_STREAM_SIZE',
        name: 'INVALID_EXPECTED_STREAM_SIZE',
      },
      null
    )
    return
  }

  if (!isValidStream(insertion.stream)) {
    const metadataMessage = new GRPC.Metadata()
    metadataMessage.add('0', JSON.stringify(insertion.stream))
    callback(
      {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'INVALID_INSERTION_STREAM',
        metadata: metadataMessage,
        name: 'INVALID_INSERTION_STREAM',
      },
      null
    )
    return
  }

  const sanitizedStream = sanitizeStream(insertion.stream)

  if (insertion.eventsList.length && !isStreamWritable(sanitizedStream)) {
    const metadataMessage = new GRPC.Metadata()
    metadataMessage.add('0', JSON.stringify(insertion.stream))
    callback(
      {
        code: GRPC.status.PERMISSION_DENIED,
        message: 'STREAM_NOT_WRITABLE',
        metadata: metadataMessage,
        name: 'STREAM_NOT_WRITABLE',
      },
      null
    )
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

  const onDbStoredEvents = (storedEvents: ReadonlyArray<DbStoredEvent>) => {
    const storedEventsListMessage = storedEvents.reduce<
      Messages.StoredEventsList
    >((message, storedEvent) => {
      message.addEvents(getStoredEventMessage(storedEvent))
      return message
    }, new Messages.StoredEventsList())

    onEventsStored(storedEvents)
    callback(null, storedEventsListMessage)
  }

  const onDbError = (error: DbError) => {
    switch (error.name) {
      case 'CONCURRENCY':
        const metadataMessage = new GRPC.Metadata()
        error.failures.forEach((failure, idx) => {
          metadataMessage.add(`${idx}`, JSON.stringify(failure))
        })
        callback(
          {
            code: GRPC.status.ABORTED,
            message: 'CONCURRENCY',
            metadata: metadataMessage,
            name: 'CONCURRENCY',
          },
          null
        )
        break

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

  const dbResults = db.appendEvents([sanitizedInsertion], uuid(), correlationId)
  const cleanListeners = () => dbResults.removeAllListeners()
  dbResults.on('stored-events', storedEvents => {
    cleanListeners()
    onDbStoredEvents(storedEvents)
  })
  dbResults.on('error', error => {
    cleanListeners()
    onDbError(error)
  })
}
