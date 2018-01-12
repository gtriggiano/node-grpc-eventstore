import Rx from 'rxjs/Rx'

import zeropad from './zeropad'

export default function eventsStreamFromStoreBus (bus) {
  let receivedEvents = { ids: [], byId: {} }

  function pushEvent (event) {
    let id = zeropad(event.id, 25)
    receivedEvents.ids.push(id)
    receivedEvents.ids.sort()
    receivedEvents.byId[id] = event
    return event
  }
  function unshiftOldestEvent () {
    let eventId = receivedEvents.ids.shift()
    let event = receivedEvents.byId[eventId]
    delete receivedEvents.byId[eventId]
    return event
  }

  let eventsStream = Rx.Observable.fromEvent(bus, 'events')
    .map((payload) => JSON.parse(payload))
    .flatMap((events) => Rx.Observable.from(events))

  if (bus.safeOrderTimeframe) {
    let timeFrame = Number(bus.safeOrderTimeframe)
    timeFrame = timeFrame && timeFrame > 0 ? timeFrame : 100
    eventsStream = eventsStream
      .map(pushEvent)
      .delay(timeFrame)
      .map(unshiftOldestEvent)
  }

  eventsStream = eventsStream.publish()
  eventsStream.connect()

  return eventsStream
}
