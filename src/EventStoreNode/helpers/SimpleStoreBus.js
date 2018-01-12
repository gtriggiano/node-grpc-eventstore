import EventEmitter from 'eventemitter3'

export default function SimpleStoreBus () {
  let bus = new EventEmitter()
  bus.publish = (eventsString) => {
    bus.emit('events', eventsString)
  }
  return bus
}
