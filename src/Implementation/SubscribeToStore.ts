// tslint:disable no-expression-statement
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
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
