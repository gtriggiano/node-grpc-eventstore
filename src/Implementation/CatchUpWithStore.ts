// tslint:disable no-expression-statement no-let
import BigNumber from 'bignumber.js'
import { noop } from 'lodash'
import { concat, ReplaySubject } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { makeStoredEventMessage } from '../helpers/messageFactories/StoredEvent'
import { PersistencyEventsStream } from '../helpers/PersistencyEventsStream'
import { IEventStoreServer, Messages } from '../proto'
import { StoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

type CatchUpWithStoreFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['catchUpWithStore']

export const CatchUpWithStore: CatchUpWithStoreFactory = ({
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

  call.once('data', (request: Messages.CatchUpWithStoreRequest) => {
    const fromEventId = BigNumber.maximum(
      0,
      request.getFromEventId()
    ).toString()

    let queryEmitter = persistency.getEvents({
      fromEventId,
      limit: 0,
    })

    let queryStream = PersistencyEventsStream(queryEmitter)

    let subscription = queryStream.subscribe(
      storedEvent => sendStoredEvent(storedEvent),
      error => call.emit('error', error),
      () => {
        queryEmitter = persistency.getEvents({
          fromEventId: BigNumber.maximum(
            fromEventId,
            idOfLastEventSent
          ).toString(),
          limit: 0,
        })

        queryStream = PersistencyEventsStream(queryEmitter)

        const filteredLiveStream = eventsStream.pipe(
          filter(({ id }) => new BigNumber(id).isGreaterThan(fromEventId))
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
