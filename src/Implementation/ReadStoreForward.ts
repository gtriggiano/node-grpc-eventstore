// tslint:disable no-expression-statement
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'
import { noop } from 'lodash'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { ReadStoreForwardRequest, StoredEvent } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStoreForwardFactory = (
  config: ImplementationConfiguration
) => GRPC.handleServerStreamingCall<ReadStoreForwardRequest, StoredEvent>

export const ReadStoreForward: ReadStoreForwardFactory = ({ db }) => call => {
  const fromEventId = BigNumber.maximum(0, call.request.getFromEventId())
  const limit = call.request.getLimit()

  call.on('error', noop)

  const dbResults = db.getEvents({
    fromEventId: fromEventId.toString(),
    limit: limit > 0 ? limit : undefined,
  })

  const dbStream = DbResultsStream(dbResults)

  dbStream.subscribe(
    storedEvent => call.write(getStoredEventMessage(storedEvent)),
    error => call.emit('error', error),
    () => call.end()
  )
}
