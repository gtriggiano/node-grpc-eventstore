import BigNumber from 'bignumber.js'
import { noop } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'

export default function ReadStoreForward ({ db }) {
  return (call) => {
    call.on('error', noop)

    let dbResults = db.getEvents({
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
