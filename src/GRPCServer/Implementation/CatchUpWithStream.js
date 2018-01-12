import Rx from 'rxjs/Rx'
import assert from 'assert'
import { noop, max } from 'lodash'

import DbResultsStream from '../helpers/DbResultsStream'
import isValidStream from '../helpers/isValidStream'
import sanitizeStream from '../helpers/sanitizeStream'

export default function CatchUpWithStream ({ db, eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()
    let endCachedFilteredLiveStream = noop
    let lastWrittenEventSequenceNumber = 0
    let writeEvent = (event) => {
      if (event.sequenceNumber <= lastWrittenEventSequenceNumber) {
        return
      }
      call.write(event)
      lastWrittenEventSequenceNumber = event.sequenceNumber
    }

    call.once('data', (request) => {
      try {
        assert(
          isValidStream(request.stream),
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

      let observedStream = sanitizeStream(request.stream)
      let requestFromSequenceNumber = max([0, request.fromSequenceNumber])

      let dbResults = db.getEventsByStream({
        stream: observedStream,
        fromSequenceNumber: requestFromSequenceNumber,
      })
      let dbStream = DbResultsStream(dbResults)

      let subscription = dbStream.subscribe(
        (event) => writeEvent(event),
        (error) => call.emit('error', error),
        () => {
          dbResults = db.getEventsByStream({
            stream: observedStream,
            fromSequenceNumber: max([
              lastWrittenEventSequenceNumber,
              requestFromSequenceNumber,
            ]),
          })
          dbStream = DbResultsStream(dbResults)

          let filteredLiveStream = eventsStream.filter(
            (event) =>
              event.stream.id === observedStream.id &&
              event.stream.type.context === observedStream.type.context &&
              event.stream.type.name === observedStream.type.name &&
              event.sequenceNumber > requestFromSequenceNumber,
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
