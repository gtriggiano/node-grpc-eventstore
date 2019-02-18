// tslint:disable no-expression-statement
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'
import { noop } from 'lodash'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { PersistencyEventsStream } from '../helpers/PersistencyEventsStream'
import { IEventStoreServer } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStoreForwardFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['readStoreForward']

export const ReadStoreForward: ReadStoreForwardFactory = ({
  persistency,
}) => call => {
  const fromEventId = BigNumber.maximum(0, call.request.getFromEventId())
  const limit = call.request.getLimit()

  call.on('error', noop)

  const queryEmitter = persistency.getEvents({
    fromEventId: fromEventId.toString(),
    limit: limit > 0 ? limit : undefined,
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
