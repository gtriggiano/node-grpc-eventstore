import { ConnectableObservable, from, fromEvent } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { delay, flatMap, map, publish } from 'rxjs/operators'

import { DbStoredEvent } from '../types'

import { EventStoreBus } from './SimpleStoreBus'
import { zeropad } from './zeropad'

interface ReceivedEvents {
  // tslint:disable-next-line:readonly-keyword readonly-array
  ids: string[]
  readonly byId: {
    // tslint:disable-next-line:readonly-keyword
    [key: string]: DbStoredEvent
  }
}

export const eventsStreamFromStoreBus = (
  eventStoreBus: EventStoreBus
): ConnectableObservable<DbStoredEvent> => {
  const receivedEvents: ReceivedEvents = { ids: [], byId: {} }

  function pushEvent<T extends DbStoredEvent>(event: T): T {
    const id = zeropad(event.id, 25)
    // tslint:disable no-expression-statement no-object-mutation
    receivedEvents.ids.push(id)
    receivedEvents.ids.sort()
    receivedEvents.byId[id] = event
    // tslint:enable
    return event
  }

  function unshiftOldestEvent(): DbStoredEvent {
    const eventId = receivedEvents.ids.shift() as string
    const event = receivedEvents.byId[eventId]
    // tslint:disable-next-line:no-delete no-object-mutation no-expression-statement
    delete receivedEvents.byId[eventId]
    // tslint:enable
    return event
  }

  const busStream = fromEvent<string>(eventStoreBus, 'events').pipe(
    map<string, ReadonlyArray<DbStoredEvent>>(serializedList =>
      JSON.parse(serializedList)
    ),
    flatMap(events => from(events))
  )

  const eventsStream = publish<DbStoredEvent>()(
    eventStoreBus.safeOrderTimeframe
      ? busStream.pipe(
          map(pushEvent),
          delay(eventStoreBus.safeOrderTimeframe),
          map(unshiftOldestEvent)
        )
      : busStream
  )

  // tslint:disable-next-line:no-expression-statement
  eventsStream.connect()

  return eventsStream
}
