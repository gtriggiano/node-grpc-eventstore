import BigNumber from 'bignumber.js'
import Rx from 'rxjs/Rx'
import { noop } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'

export default function CatchUpWithStore ({ db, eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()
    let endCachedLiveStream = noop
    let lastWrittenEventId = new BigNumber('0')
    let writeEvent = (event) => {
      let eventId = new BigNumber(event.id)
      if (eventId.lessThanOrEqualTo(lastWrittenEventId)) {
        return
      }
      call.write(event)
      lastWrittenEventId = eventId
    }

    call.once('data', (request) => {
      let requestFromEventId = new BigNumber(request.fromEventId)
      let dbResults = db.getEvents({
        fromEventId: BigNumber.max([
          lastWrittenEventId,
          requestFromEventId,
        ]).toString(),
      })
      let dbStream = DbResultsStream(dbResults)

      let subscription = dbStream.subscribe(
        (event) => writeEvent(event),
        (error) => call.emit('error', error),
        () => {
          dbResults = db.getEvents({
            fromEventId: BigNumber.max([
              lastWrittenEventId,
              requestFromEventId,
            ]).toString(),
          })
          dbStream = DbResultsStream(dbResults)

          let filteredLiveStream = eventsStream.filter(({ id }) =>
            new BigNumber(id).greaterThan(requestFromEventId),
          )

          let cachedFilteredLiveStream = new Rx.ReplaySubject()
          let cachedFilteredLiveStreamSubscription = filteredLiveStream.subscribe(
            (event) => cachedFilteredLiveStream.next(event),
          )

          endCachedLiveStream = () => {
            cachedFilteredLiveStreamSubscription.unsubscribe()
            cachedFilteredLiveStream.complete()
            setTimeout(() => cachedFilteredLiveStream._events.splice(0), 10)
          }

          dbStream
            .toPromise()
            .then(endCachedLiveStream)
            .catch(endCachedLiveStream)

          subscription = dbStream
            .concat(cachedFilteredLiveStream, filteredLiveStream)
            .subscribe(
              (event) => writeEvent(event),
              (error) => call.emit('error', error),
            )
        },
      )
      onClientTermination = () => {
        endCachedLiveStream()
        subscription.unsubscribe()
        call.end()
      }
    })

    call.on('end', () => onClientTermination())
  }
}
