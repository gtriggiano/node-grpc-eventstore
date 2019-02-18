// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { PersistencyEventsStream } from '../helpers/PersistencyEventsStream'
import { IEventStoreServer } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStreamForwardFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['readStreamForward']

export const ReadStreamForward: ReadStreamForwardFactory = ({
  persistency,
}) => call => {
  const streamMessage = call.request.getStream()

  if (!streamMessage) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_NOT_PROVIDED',
      name: 'STREAM_NOT_PROVIDED',
    })
    return
  }

  const stream = streamMessage.toObject()
  if (!stream.type) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_PROVIDED',
      name: 'STREAM_TYPE_NOT_PROVIDED',
    })
    return
  }

  const observedStream = {
    id: stream.id,
    type: stream.type,
  }
  const fromSequenceNumber = call.request.getFromSequenceNumber()
  const limit = call.request.getLimit()

  const queryEmitter = persistency.getEventsByStream({
    fromSequenceNumber: Math.max(0, fromSequenceNumber),
    limit: Math.max(0, limit),
    stream: observedStream,
  })

  const eventsStream = PersistencyEventsStream(queryEmitter)

  eventsStream.subscribe(
    storedEvent => call.write(makeStoredEventMessage(storedEvent)),
    error =>
      call.emit('error', {
        code: GRPC.status.UNAVAILABLE,
        message: error.message,
        name: error.name,
      }),
    () => call.end()
  )
}
