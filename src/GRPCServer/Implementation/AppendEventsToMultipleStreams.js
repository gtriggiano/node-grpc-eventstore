import assert from 'assert'
import uuid from 'uuid'
import { uniq } from 'lodash'

import validateAppendRequest from '../helpers/validateAppendRequest'
import sanitizeStream from '../helpers/sanitizeStream'
import streamToString from '../helpers/streamToString'

export default function AppendEventsToMultipleStreams ({
  db,
  onEventsStored,
  isStreamWritable,
}) {
  return (call, callback) => {
    let appendRequests
    try {
      assert(
        call.request.appendRequests && call.request.appendRequests.length,
        `appendRequests should be a non empty list of requests`,
      )
      call.request.appendRequests.forEach((appendRequest) =>
        validateAppendRequest(appendRequest, isStreamWritable),
      )
      appendRequests = call.request.appendRequests.map((request) => ({
        ...request,
        stream: sanitizeStream(request.stream),
      }))

      let involvedStreams = uniq(
        appendRequests.map(({ stream }) => streamToString(stream)),
      )
      assert(
        involvedStreams.length === call.request.appendRequests.length,
        `each appendRequest should concern a different stream`,
      )
    } catch (e) {
      return callback(e)
    }

    let dbResults = db.appendEvents({
      appendRequests: appendRequests,
      transactionId: uuid(),
      correlationId: call.request.correlationId || null,
    })

    function cleanListeners () {
      dbResults.removeListener('error', onError)
      dbResults.removeListener('stored-events', onStoredEvents)
    }
    function onError (err) {
      cleanListeners()
      callback(err)
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
