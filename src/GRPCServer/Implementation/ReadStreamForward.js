import assert from 'assert'
import { noop, max } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'
import isValidStream from '../helpers/isValidStream'
import sanitizeStream from '../helpers/sanitizeStream'

export default function ReadStreamForward ({ db }) {
  return (call) => {
    call.on('error', noop)

    try {
      assert(
        isValidStream(call.request.stream),
        `stream is an object like {id: String, type: {context: String, name: String}}`,
      )
    } catch (e) {
      return call.emit(
        'error',
        new TypeError(
          `stream should be an object like {id: String, type: {context: String, name: String}}`,
        ),
      )
    }

    let dbResults = db.getEventsByStream({
      stream: sanitizeStream(call.request.stream),
      fromSequenceNumber: max([0, call.request.fromSequenceNumber]),
      limit: call.request.limit > 0 ? call.request.limit : null,
    })
    let dbStream = DbResultsStream(dbResults)
    dbStream.subscribe(
      (event) => call.write(event),
      (error) => call.emit('error', error),
      () => call.end(),
    )
  }
}
