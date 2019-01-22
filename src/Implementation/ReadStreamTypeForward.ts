// tslint:disable no-expression-statement no-if-statement
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'

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

  if (!streamTypeMessage) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_PROVIDED',
      name: 'STREAM_TYPE_NOT_PROVIDED',
    })
    return
  }

  const streamType = streamTypeMessage.toObject()

  if (!isValidStreamType(streamType)) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_VALID',
      name: 'STREAM_TYPE_NOT_VALID',
    })
    return
  }

  const observedStreamType = sanitizeStreamType(streamType)
  const fromEventId = BigNumber.maximum(0, call.request.getFromEventId())
  const limit = call.request.getLimit()

  const dbResults = db.getEventsByStreamType({
    fromEventId: fromEventId.toString(),
    limit: limit > 0 ? limit : undefined,
    streamType: observedStreamType,
  })

  const dbStream = DbResultsStream(dbResults)

  dbStream.subscribe(
    storedEvent => call.write(getStoredEventMessage(storedEvent)),
    error => call.emit('error', error),
    () => call.end()
  )
}
