// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
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

  const dbResult = await persistency.getLastStoredEvent()

  if (dbResult.isLeft()) {
    return callback(
      {
        code: GRPC.status.UNAVAILABLE,
        message: dbResult.value.message,
        name: dbResult.value.name || dbResult.value.type,
      },
      null
    )
  }

  if (dbResult.value) {
    result.setEvent(makeStoredEventMessage(dbResult.value))
  }

  callback(null, result)
}
