// tslint:disable no-expression-statement no-if-statement
import * as GRPC from 'grpc'
import { noop } from 'lodash'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStream } from '../helpers/isValidStream'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { ReadStreamForwardRequest, StoredEvent } from '../proto'

import { ImplementationConfiguration } from './index'

type ReadStreamForwardFactory = (
  config: ImplementationConfiguration
) => GRPC.handleServerStreamingCall<ReadStreamForwardRequest, StoredEvent>

export const ReadStreamForward: ReadStreamForwardFactory = ({ db }) => call => {
  const streamMessage = call.request.getStream()
  const stream = streamMessage && streamMessage.toObject()
  const fromSequenceNumber = call.request.getFromSequenceNumber()
  const limit = call.request.getLimit()

  if (isValidStream(stream)) {
    call.on('error', noop)

    const dbResults = db.getEventsByStream({
      fromSequenceNumber: Math.max(0, fromSequenceNumber),
      limit: limit > 0 ? limit : undefined,
      stream: sanitizeStream(stream),
    })

    const dbStream = DbResultsStream(dbResults)

    dbStream.subscribe(
      storedEvent => call.write(getStoredEventMessage(storedEvent)),
      error => call.emit('error', error),
      () => call.end()
    )
  } else {
    try {
      isValidStream(stream, true)
    } catch (error) {
      call.emit('error', {})
    }
  }
}
