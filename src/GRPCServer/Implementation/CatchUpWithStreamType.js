import BigNumber from 'bignumber.js'
import Rx from 'rxjs/Rx'
import assert from 'assert'
import { noop } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'
import isValidStreamType from '../helpers/isValidStreamType'
import sanitizeStreamType from '../helpers/sanitizeStreamType'

export default function CatchUpWithStreamType ({ db, eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()
    let endCachedFilteredLiveStream = noop
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
      try {
        assert(
          isValidStreamType(request.streamType),
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

      let requestFromEventId = new BigNumber(request.fromEventId)
      let observedType = sanitizeStreamType(request.streamType)

      let dbResults = db.getEventsByStreamType({
        streamType: observedType,
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
          dbResults = db.getEventsByStreamType({
            streamType: observedType,
            fromEventId: BigNumber.max([
              lastWrittenEventId,
              requestFromEventId,
            ]).toString(),
          })
          dbStream = DbResultsStream(dbResults)

          let filteredLiveStream = eventsStream.filter(
            (event) =>
              event.stream.type.context === observedType.context &&
              event.stream.type.name === observedType.name &&
              event.id > request.fromEventId,
          )

          let cachedFilteredLiveStream = new Rx.ReplaySubject()
          let cachedFilteredLiveStreamSubscription = filteredLiveStream.subscribe(
            (event) => cachedFilteredLiveStream.next(event),
          )

          endCachedFilteredLiveStream = () => {
            cachedFilteredLiveStreamSubscription.unsubscribe()
            cachedFilteredLiveStream.complete()
            setTimeout(() => cachedFilteredLiveStream._events.splice(0), 10)
          }

          dbStream
            .toPromise()
            .then(endCachedFilteredLiveStream)
            .catch(endCachedFilteredLiveStream)

          subscription = dbStream
            .concat(cachedFilteredLiveStream, filteredLiveStream)
            .subscribe(
              (event) => writeEvent(event),
              (error) => call.emit('error', error),
            )
        },
      )
      onClientTermination = () => {
        endCachedFilteredLiveStream()
        subscription.unsubscribe()
        call.end()
      }
    })

    call.on('end', () => onClientTermination())
  }
}
