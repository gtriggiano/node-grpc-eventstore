// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStreamType } from '../helpers/isValidStreamType'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { IEventStoreServer } from '../proto'
import { Stream } from '../types'

import { ImplementationConfiguration } from './index'

type ReadStreamForwardFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['readStreamForward']

export const ReadStreamForward: ReadStreamForwardFactory = ({ db }) => call => {
  const streamMessage = call.request.getStream()

  if (!streamMessage) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_NOT_PROVIDED',
      name: 'STREAM_NOT_PROVIDED',
    })
    return
  }

  const stream = streamMessage.toObject()
  if (!stream.type) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_PROVIDED',
      name: 'STREAM_TYPE_NOT_PROVIDED',
    })
    return
  }

  if (!isValidStreamType(stream.type)) {
    call.emit('error', {
      code: GRPC.status.INVALID_ARGUMENT,
      message: 'STREAM_TYPE_NOT_VALID',
      name: 'STREAM_TYPE_NOT_VALID',
    })
    return
  }

  const observedStream = sanitizeStream(stream as Stream)
  const fromSequenceNumber = call.request.getFromSequenceNumber()
  const limit = call.request.getLimit()

  const dbResults = db.getEventsByStream({
    fromSequenceNumber: Math.max(0, fromSequenceNumber),
    limit: limit > 0 ? limit : undefined,
    stream: observedStream,
  })

  const dbStream = DbResultsStream(dbResults)

  dbStream.subscribe(
    storedEvent => call.write(getStoredEventMessage(storedEvent)),
    error => call.emit('error', error),
    () => call.end()
  )
}
