import BigNumber from 'bignumber.js'
import assert from 'assert'
import { noop } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'
import isValidStreamType from '../helpers/isValidStreamType'
import sanitizeStreamType from '../helpers/sanitizeStreamType'

export default function ReadStreamTypeForward ({ db }) {
  return (call) => {
    call.on('error', noop)

    try {
      assert(
        isValidStreamType(call.request.streamType),
        `streamType is an object like {context: String, name: String}`,
      )
    } catch (e) {
      return call.emit(
        'error',
        new TypeError(
          'streamType should be an object like {context: String, name: String}',
        ),
      )
    }

    let dbResults = db.getEventsByStreamType({
      streamType: sanitizeStreamType(call.request.streamType),
      fromEventId: BigNumber.max([
        new BigNumber('0'),
        new BigNumber(call.request.fromEventId),
      ]).toString(),
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
