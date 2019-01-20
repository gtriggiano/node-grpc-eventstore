// tslint:disable no-expression-statement no-let
import BigNumber from 'bignumber.js'
import * as GRPC from 'grpc'
import { noop } from 'lodash'
import { ReplaySubject } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { concat, filter } from 'rxjs/operators'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { CatchUpWithStoreRequest, StoredEvent } from '../proto'
import { DbStoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

type CatchUpWithStoreFactory = (
  config: ImplementationConfiguration
) => GRPC.handleBidiStreamingCall<CatchUpWithStoreRequest, StoredEvent>

export const CatchUpWithStore: CatchUpWithStoreFactory = ({
  db,
  eventsStream,
}) => call => {
  call.on('end', () => onClientTermination())

  let onClientTermination = () => call.end()
  let endCachedLiveStream = noop
  let idOfLastEventSent = new BigNumber(0)

  const sendStoredEvent = (storedEvent: DbStoredEvent) => {
    const eventId = new BigNumber(storedEvent.id)
    const shouldSendEvent = eventId.isGreaterThan(idOfLastEventSent)
    switch (shouldSendEvent) {
      case true:
        call.write(getStoredEventMessage(storedEvent))
        idOfLastEventSent = eventId
        break

      default:
        break
    }
  }

  call.once('data', (request: CatchUpWithStoreRequest) => {
    const fromEventId = BigNumber.maximum(
      0,
      request.getFromEventId()
    ).toString()

    let dbResults = db.getEvents({
      fromEventId,
      limit: undefined,
    })

    let dbStream = DbResultsStream(dbResults)

    let subscription = dbStream.subscribe(
      storedEvent => sendStoredEvent(storedEvent),
      error => call.emit('error', error),
      () => {
        dbResults = db.getEvents({
          fromEventId: BigNumber.maximum(
            fromEventId,
            idOfLastEventSent
          ).toString(),
          limit: undefined,
        })

        dbStream = DbResultsStream(dbResults)

        const filteredLiveStream = eventsStream.pipe(
          filter(({ id }) => new BigNumber(id).isGreaterThan(fromEventId))
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
          .pipe(concat(cachedFilteredLiveStream, filteredLiveStream))
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
