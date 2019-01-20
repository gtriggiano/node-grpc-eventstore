// tslint:disable no-expression-statement no-if-statement
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'
import { noop } from 'lodash'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStreamType } from '../helpers/isValidStreamType'
import { sanitizeStreamType } from '../helpers/sanitizeStreamType'
import { ReadStreamTypeForwardRequest, StoredEvent } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStreamTypeForwardFactory = (
  config: ImplementationConfiguration
) => GRPC.handleServerStreamingCall<ReadStreamTypeForwardRequest, StoredEvent>

export const ReadStreamTypeForward: ReadStreamTypeForwardFactory = ({
  db,
}) => call => {
  const streamTypeMessage = call.request.getStreamType()
  const streamType = streamTypeMessage && streamTypeMessage.toObject()
  const fromEventId = BigNumber.maximum(0, call.request.getFromEventId())
  const limit = call.request.getLimit()

  if (isValidStreamType(streamType)) {
    call.on('error', noop)

    const dbResults = db.getEventsByStreamType({
      fromEventId: fromEventId.toString(),
      limit: limit > 0 ? limit : undefined,
      streamType: sanitizeStreamType(streamType),
    })

    const dbStream = DbResultsStream(dbResults)

    dbStream.subscribe(
      storedEvent => call.write(getStoredEventMessage(storedEvent)),
      error => call.emit('error', error),
      () => call.end()
    )
  } else {
    try {
      isValidStreamType(streamType, true)
    } catch (error) {
      call.emit('error', {})
    }
  }
}
