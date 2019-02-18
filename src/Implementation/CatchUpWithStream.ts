// tslint:disable no-expression-statement no-let no-if-statement
import * as GRPC from 'grpc'
import { noop } from 'lodash'
import { concat, ReplaySubject } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { PersistencyEventsStream } from '../helpers/PersistencyEventsStream'
import { IEventStoreServer, Messages } from '../proto'
import { StoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

type CatchUpWithStreamFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['catchUpWithStream']

export const CatchUpWithStream: CatchUpWithStreamFactory = ({
  persistency,
  eventsStream,
}) => call => {
  call.on('end', () => onClientTermination())

  let onClientTermination = () => call.end()
  let endCachedLiveStream = noop
  let sequenceNumberOfLastEventSent = 0

  const sendStoredEvent = (storedEvent: StoredEvent) => {
    const shouldSendEvent =
      storedEvent.sequenceNumber > sequenceNumberOfLastEventSent
    switch (shouldSendEvent) {
      case true:
        call.write(makeStoredEventMessage(storedEvent))
        sequenceNumberOfLastEventSent = storedEvent.sequenceNumber
        break

      default:
        break
    }
  }

  call.once('data', (request: Messages.CatchUpWithStreamRequest) => {
    const streamMessage = request.getStream()
    const stream = streamMessage && streamMessage.toObject()

    if (!stream) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_NOT_PROVIDED',
        name: 'STREAM_NOT_PROVIDED',
      })
      return
    }

    if (!stream.type) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_PROVIDED',
        name: 'STREAM_TYPE_NOT_PROVIDED',
      })
      return
    }

    const observedStream = {
      id: stream.id,
      type: stream.type,
    }

    const requestFromSequenceNumber = Math.max(
      0,
      request.getFromSequenceNumber()
    )

    let queryEmitter = persistency.getEventsByStream({
      fromSequenceNumber: requestFromSequenceNumber,
      limit: 0,
      stream: observedStream,
    })

    let queryStream = PersistencyEventsStream(queryEmitter)

    let subscription = queryStream.subscribe(
      storedEvent => sendStoredEvent(storedEvent),
      error => call.emit('error', error),
      () => {
        queryEmitter = persistency.getEventsByStream({
          fromSequenceNumber: Math.max(
            sequenceNumberOfLastEventSent,
            requestFromSequenceNumber
          ),
          limit: 0,
          stream: observedStream,
        })

        queryStream = PersistencyEventsStream(queryEmitter)

        const filteredLiveStream = eventsStream.pipe(
          filter(
            storedEvent =>
              storedEvent.stream.id === observedStream.id &&
              storedEvent.stream.type.context === observedStream.type.context &&
              storedEvent.stream.type.name === observedStream.type.name &&
              storedEvent.sequenceNumber > requestFromSequenceNumber
          )
        )

        const cachedFilteredLiveStream = new ReplaySubject<StoredEvent>()
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

        queryStream
          .toPromise()
          .then(endCachedLiveStream)
          .catch(endCachedLiveStream)

        subscription = queryStream
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
  })
}
