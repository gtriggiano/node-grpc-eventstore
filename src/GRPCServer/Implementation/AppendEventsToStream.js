import assert from 'assert'
import uuid from 'uuid'
import { isNil } from 'lodash'

import validateAppendRequest from '../helpers/validateAppendRequest'
import sanitizeStream from '../helpers/sanitizeStream'

export const ANY_SEQUENCE_NUMBER = -2
export const ANY_POSITIVE_SEQUENCE_NUMBER = -1

export default function AppendEventsToStream ({
  db,
  onEventsStored,
  isStreamWritable,
}) {
  return (call, callback) => {
    try {
      assert(
        !isNil(call.request.appendRequest),
        `an appendRequest should be passed to this method`,
      )
      validateAppendRequest(call.request.appendRequest, isStreamWritable)
    } catch (e) {
      return callback(e)
    }

    let appendRequest = {
      ...call.request.appendRequest,
      stream: sanitizeStream(call.request.appendRequest.stream),
    }

    let dbResults = db.appendEvents({
      appendRequests: [appendRequest],
      transactionId: uuid(),
      correlationId: call.request.correlationId || null,
    })

    function cleanListeners () {
      dbResults.removeListener('error', onError)
      dbResults.removeListener('stored-events', onStoredEvents)
    }
    function onError (error) {
      cleanListeners()
      callback(error)
    }
    function onStoredEvents (storedEvents) {
      cleanListeners()
      onEventsStored(storedEvents)
      callback(null, { events: storedEvents })
    }

    dbResults.on('error', onError)
    dbResults.on('stored-events', onStoredEvents)
  }
}
