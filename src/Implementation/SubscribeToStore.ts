// tslint:disable no-expression-statement
import * as GRPC from 'grpc'

import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { Empty, StoredEvent } from '../proto'

import { ImplementationConfiguration } from './index'

type SubscribeToStoreFactory = (
  config: ImplementationConfiguration
) => GRPC.handleBidiStreamingCall<Empty, StoredEvent>

export const SubscribeToStore: SubscribeToStoreFactory = ({
  eventsStream,
}) => call => {
  // tslint:disable-next-line:no-let
  let onClientTermination = () => call.end()

  call.on('end', () => onClientTermination())

  call.once('data', () => {
    const subscription = eventsStream.subscribe(
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
