// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStreamType } from '../helpers/isValidStreamType'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { StoredEvent, SubscribeToStreamRequest } from '../proto'
import { Stream } from '../types'

import { ImplementationConfiguration } from './index'

type SubscribeToStreamFactory = (
  config: ImplementationConfiguration
) => GRPC.handleBidiStreamingCall<SubscribeToStreamRequest, StoredEvent>

export const SubscribeToStream: SubscribeToStreamFactory = ({
  eventsStream,
}) => call => {
  // tslint:disable-next-line:no-let
  let onClientTermination = () => call.end()

  call.on('end', () => onClientTermination())

  call.once('data', (request: SubscribeToStreamRequest) => {
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

    if (!isValidStreamType(stream.type)) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_VALID',
        name: 'STREAM_TYPE_NOT_VALID',
      })
      call.removeAllListeners()
      return
    }

    const observedStream = sanitizeStream(stream as Stream)

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
        storedEvent => call.write(getStoredEventMessage(storedEvent)),
        error => call.emit('error', error)
      )

    onClientTermination = () => {
      subscription.unsubscribe()
      call.removeAllListeners()
      call.end()
    }
  })
}
