// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStreamType } from '../helpers/isValidStreamType'
import { sanitizeStreamType } from '../helpers/sanitizeStreamType'
import { IEventStoreServer, Messages } from '../proto'

import { ImplementationConfiguration } from './index'

type SubscribeToStreamTypeFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['subscribeToStreamType']

export const SubscribeToStreamType: SubscribeToStreamTypeFactory = ({
  eventsStream,
}) => call => {
  // tslint:disable-next-line:no-let
  let onClientTermination = () => call.end()

  call.on('end', () => onClientTermination())

  call.once('data', (request: Messages.SubscribeToStreamTypeRequest) => {
    const streamTypeMessage = request.getStreamType()

    if (!streamTypeMessage) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_PROVIDED',
        name: 'STREAM_TYPE_NOT_PROVIDED',
      })
      call.removeAllListeners()
      return
    }

    const streamType = streamTypeMessage.toObject()

    if (!isValidStreamType(streamType)) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_VALID',
        name: 'STREAM_TYPE_NOT_VALID',
      })
      call.removeAllListeners()
      return
    }

    const observedStreamType = sanitizeStreamType(streamType)

    const subscription = eventsStream
      .pipe(
        filter(
          storedEvent =>
            storedEvent.stream.type.context === observedStreamType.context &&
            storedEvent.stream.type.name === observedStreamType.name
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
