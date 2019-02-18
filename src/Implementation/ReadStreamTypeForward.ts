// tslint:disable no-expression-statement no-if-statement
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { PersistencyEventsStream } from '../helpers/PersistencyEventsStream'
import { IEventStoreServer } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStreamTypeForwardFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['readStreamTypeForward']

export const ReadStreamTypeForward: ReadStreamTypeForwardFactory = ({
  persistency,
}) => call => {
  const streamTypeMessage = call.request.getStreamType()

  if (!streamTypeMessage) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_PROVIDED',
      name: 'STREAM_TYPE_NOT_PROVIDED',
    })
    return
  }

  const observedStreamType = streamTypeMessage.toObject()
  const fromEventId = BigNumber.maximum(0, call.request.getFromEventId())
  const limit = call.request.getLimit()

  const queryEmitter = persistency.getEventsByStreamType({
    fromEventId: fromEventId.toString(),
    limit: limit > 0 ? limit : undefined,
    streamType: observedStreamType,
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
