// tslint:disable no-expression-statement no-let no-if-statement
import BigNumber from 'bignumber.js'
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

type CatchUpWithStreamTypeFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['catchUpWithStreamType']

export const CatchUpWithStreamType: CatchUpWithStreamTypeFactory = ({
  persistency,
  eventsStream,
}) => call => {
  call.on('end', () => onClientTermination())

  let onClientTermination = () => call.end()
  let endCachedLiveStream = noop
  let idOfLastEventSent = new BigNumber(0)

  const sendStoredEvent = (storedEvent: StoredEvent) => {
    const eventId = new BigNumber(storedEvent.id)
    const shouldSendEvent = eventId.isGreaterThan(idOfLastEventSent)
    switch (shouldSendEvent) {
      case true:
        call.write(makeStoredEventMessage(storedEvent))
        idOfLastEventSent = eventId
        break

      default:
        break
    }
  }

  call.once('data', (request: Messages.CatchUpWithStreamTypeRequest) => {
    const streamTypeMessage = request.getStreamType()
    const streamType = streamTypeMessage && streamTypeMessage.toObject()

    if (!streamType) {
      call.emit('error', {
        code: GRPC.status.INVALID_ARGUMENT,
        message: 'STREAM_TYPE_NOT_PROVIDED',
        name: 'STREAM_TYPE_NOT_PROVIDED',
      })
      return
    }

    const requestFromEventId = BigNumber.maximum(
      0,
      request.getFromEventId()
    ).toString()

    let queryEmitter = persistency.getEventsByStreamType({
      fromEventId: requestFromEventId,
      limit: 0,
      streamType,
    })

    let queryStream = PersistencyEventsStream(queryEmitter)

    let subscription = queryStream.subscribe(
      storedEvent => sendStoredEvent(storedEvent),
      error => call.emit('error', error),
      () => {
        queryEmitter = persistency.getEventsByStreamType({
          fromEventId: BigNumber.maximum(
            idOfLastEventSent,
            requestFromEventId
          ).toString(),
          limit: 0,
          streamType,
        })

        queryStream = PersistencyEventsStream(queryEmitter)

        const filteredLiveStream = eventsStream.pipe(
          filter(
            storedEvent =>
              storedEvent.stream.type.context === streamType.context &&
              storedEvent.stream.type.name === streamType.name &&
              new BigNumber(storedEvent.id).isGreaterThan(requestFromEventId)
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
          .pipe(stream =>
            concat(stream, cachedFilteredLiveStream, filteredLiveStream)
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
