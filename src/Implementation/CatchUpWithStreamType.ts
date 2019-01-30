// tslint:disable no-expression-statement no-let no-if-statement
import BigNumber from 'bignumber.js'
import { noop } from 'lodash'
import { concat, ReplaySubject } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { filter } from 'rxjs/operators'

import { DbResultsStream } from '../helpers/DbResultsStream'
import { getStoredEventMessage } from '../helpers/getStoredEventMessage'
import { IEventStoreServer, Messages } from '../proto'
import { DbStoredEvent } from '../types'

import { isValidStreamType } from '../helpers/isValidStreamType'
import { sanitizeStreamType } from '../helpers/sanitizeStreamType'
import { ImplementationConfiguration } from './index'

type CatchUpWithStreamTypeFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['catchUpWithStreamType']

export const CatchUpWithStreamType: CatchUpWithStreamTypeFactory = ({
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

  call.once('data', (request: Messages.CatchUpWithStreamTypeRequest) => {
    const streamTypeMessage = request.getStreamType()
    const streamType = streamTypeMessage && streamTypeMessage.toObject()

    if (isValidStreamType(streamType)) {
      const observedStreamType = sanitizeStreamType(streamType)
      const requestFromEventId = BigNumber.maximum(
        0,
        request.getFromEventId()
      ).toString()

      let dbResults = db.getEventsByStreamType({
        fromEventId: requestFromEventId,
        limit: undefined,
        streamType: observedStreamType,
      })

      let dbStream = DbResultsStream(dbResults)

      let subscription = dbStream.subscribe(
        storedEvent => sendStoredEvent(storedEvent),
        error => call.emit('error', error),
        () => {
          dbResults = db.getEventsByStreamType({
            fromEventId: BigNumber.maximum(
              idOfLastEventSent,
              requestFromEventId
            ).toString(),
            limit: undefined,
            streamType: observedStreamType,
          })

          dbStream = DbResultsStream(dbResults)

          const filteredLiveStream = eventsStream.pipe(
            filter(
              storedEvent =>
                storedEvent.stream.type.context ===
                  observedStreamType.context &&
                storedEvent.stream.type.name === observedStreamType.name &&
                new BigNumber(storedEvent.id).isGreaterThan(requestFromEventId)
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
    } else {
      try {
        isValidStreamType(streamType, true)
      } catch (error) {
        call.emit('error', {})
      }
    }
  })
}
