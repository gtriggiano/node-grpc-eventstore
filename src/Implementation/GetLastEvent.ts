// tslint:disable no-expression-statement no-if-statement
import {
  makeAvailabilityErrorMessage,
  makeStoredEventMessage,
} from '../helpers/messageFactories'
import { IEventStoreServer, Messages } from '../proto'

import { ImplementationConfiguration } from './index'

type GetLastEventFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['getLastEvent']

export const GetLastEvent: GetLastEventFactory = ({ persistency }) => async (
  _,
  callback
) => {
  const result = new Messages.GetLastEventResult()

  const persistencyResponse = await persistency.getLastStoredEvent()

  if (persistencyResponse.isLeft()) {
    result.setAvailabilityError(
      makeAvailabilityErrorMessage(persistencyResponse.value)
    )
  } else if (persistencyResponse.value) {
    result.setEvent(makeStoredEventMessage(persistencyResponse.value))
  }

  callback(null, result)
}
