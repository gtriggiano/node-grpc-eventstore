// tslint:disable no-expression-statement no-if-statement no-submodule-imports
import * as GRPC from 'grpc'
import { filter } from 'rxjs/operators'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { IEventStoreServer, Messages } from '../proto'

import { ImplementationConfiguration } from './index'

type SubscribeToStreamFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['subscribeToStream']

export const SubscribeToStream: SubscribeToStreamFactory = ({
  eventsStream,
}) => call => {
  // tslint:disable-next-line:no-let
  let onClientTermination = () => call.end()

  call.on('end', () => onClientTermination())

  call.once('data', (request: Messages.SubscribeToStreamRequest) => {
    const streamMessage = request.getStream()

    if (!streamMessage) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_NOT_PROVIDED',
        name: 'STREAM_NOT_PROVIDED',
      })
      call.removeAllListeners()
      return
    }

    const stream = streamMessage.toObject()
    if (!stream.type) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_PROVIDED',
        name: 'STREAM_TYPE_NOT_PROVIDED',
      })
      call.removeAllListeners()
      return
    }

    const observedStream = {
      id: stream.id,
      type: stream.type,
    }

    const subscription = eventsStream
      .pipe(
        filter(
          storedEvent =>
            storedEvent.stream.id === observedStream.id &&
            storedEvent.stream.type.context === observedStream.type.context &&
            storedEvent.stream.type.name === observedStream.type.name
        )
      )
      .subscribe(
        storedEvent => call.write(makeStoredEventMessage(storedEvent)),
        error =>
          call.emit('error', {
            code: GRPC.status.UNAVAILABLE,
            message: error.message,
            name: error.name,
          })
      )

    onClientTermination = () => {
      subscription.unsubscribe()
      call.removeAllListeners()
      call.end()
    }
  })
}
