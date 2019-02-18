// tslint:disable no-expression-statement
import * as GRPC from 'grpc'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { IEventStoreServer } from '../proto'

import { ImplementationConfiguration } from './index'

type SubscribeToStoreFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['subscribeToStore']

export const SubscribeToStore: SubscribeToStoreFactory = ({
  eventsStream,
}) => call => {
  // tslint:disable-next-line:no-let
  let onClientTermination = () => call.end()

  call.on('end', () => onClientTermination())

  call.once('data', () => {
    const subscription = eventsStream.subscribe(
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
