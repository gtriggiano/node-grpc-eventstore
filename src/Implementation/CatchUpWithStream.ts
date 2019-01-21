// tslint:disable no-expression-statement no-let no-if-statement
import * as GRPC from 'grpc'
import { noop } from 'lodash'
import { concat, ReplaySubject } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { isValidStream } from '../helpers/isValidStream'
import { sanitizeStream } from '../helpers/sanitizeStream'
import { CatchUpWithStreamRequest, StoredEvent } from '../proto'
import { DbStoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

type CatchUpWithStreamFactory = (
  config: ImplementationConfiguration
) => GRPC.handleBidiStreamingCall<CatchUpWithStreamRequest, StoredEvent>

export const CatchUpWithStream: CatchUpWithStreamFactory = ({
  db,
  eventsStream,
}) => call => {
  call.on('end', () => onClientTermination())

  let onClientTermination = () => call.end()
  let endCachedLiveStream = noop
  let sequenceNumberOfLastEventSent = 0

  const sendStoredEvent = (storedEvent: DbStoredEvent) => {
    const shouldSendEvent =
      storedEvent.sequenceNumber > sequenceNumberOfLastEventSent
    switch (shouldSendEvent) {
      case true:
        call.write(getStoredEventMessage(storedEvent))
        sequenceNumberOfLastEventSent = storedEvent.sequenceNumber
        break

      default:
        break
    }
  }

  call.once('data', (request: CatchUpWithStreamRequest) => {
    const streamMessage = request.getStream()
    const stream = streamMessage && streamMessage.toObject()

    if (isValidStream(stream)) {
      const observedStream = sanitizeStream(stream)
      const requestFromSequenceNumber = Math.max(
        0,
        request.getFromSequenceNumber()
      )

      let dbResults = db.getEventsByStream({
        fromSequenceNumber: requestFromSequenceNumber,
        limit: undefined,
        stream: observedStream,
      })

      let dbStream = DbResultsStream(dbResults)

      let subscription = dbStream.subscribe(
        storedEvent => sendStoredEvent(storedEvent),
        error => call.emit('error', error),
        () => {
          dbResults = db.getEventsByStream({
            fromSequenceNumber: Math.max(
              sequenceNumberOfLastEventSent,
              requestFromSequenceNumber
            ),
            limit: undefined,
            stream: observedStream,
          })

          dbStream = DbResultsStream(dbResults)

          const filteredLiveStream = eventsStream.pipe(
            filter(
              storedEvent =>
                storedEvent.stream.id === observedStream.id &&
                storedEvent.stream.type.context ===
                  observedStream.type.context &&
                storedEvent.stream.type.name === observedStream.type.name &&
                storedEvent.sequenceNumber > requestFromSequenceNumber
            )
          )

          const cachedFilteredLiveStream = new ReplaySubject<DbStoredEvent>()
          const cachedFilteredLiveStreamSubscription = filteredLiveStream.subscribe(
            storedEvent => cachedFilteredLiveStream.next(storedEvent)
          )

          endCachedLiveStream = () => {
            cachedFilteredLiveStreamSubscription.unsubscribe()
            cachedFilteredLiveStream.complete()
            setTimeout(
              () => (cachedFilteredLiveStream as any)._events.splice(0),
              10
            )
          }

          dbStream
            .toPromise()
            .then(endCachedLiveStream)
            .catch(endCachedLiveStream)

          subscription = dbStream
            .pipe(strm =>
              concat(strm, cachedFilteredLiveStream, filteredLiveStream)
            )
            .subscribe(
              storedEvent => sendStoredEvent(storedEvent),
              error => call.emit('error', error)
            )
        }
      )

      onClientTermination = () => {
        endCachedLiveStream()
        subscription.unsubscribe()
        call.end()
      }
    } else {
      try {
        isValidStream(stream, true)
      } catch (error) {
        call.emit('error', {})
      }
    }
  })
}
