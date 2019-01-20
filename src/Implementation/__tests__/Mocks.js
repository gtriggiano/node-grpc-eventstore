import 'jest'
import EventEmitter from 'eventemitter3'

import { InMemoryDatabaseAdapter, SimpleStoreBus } from '../../../dist/main'
import { eventsStreamFromStoreBus } from '../../../dist/main/helpers/eventsStreamFromStoreBus'

const RPCCall = () => {
  const call = new EventEmitter()
  const callObserver = new EventEmitter()
  jest.spyOn(call, 'on')
  jest.spyOn(call, 'once')
  jest.spyOn(call, 'emit')
  jest.spyOn(call, 'removeAllListeners')
  call.write = jest.fn((...args) => callObserver.emit('write', ...args))
  call.end = jest.fn(() => callObserver.emit('end'))
  return { call, callObserver }
}

const defaultIsStreamWritable = () => true

export default (isStreamWritable = defaultIsStreamWritable) => {
  const database = InMemoryDatabaseAdapter()
  const storeBus = SimpleStoreBus()
  const eventsStream = eventsStreamFromStoreBus(storeBus)
  const onEventsStored = jest.fn(storedEvents =>
    storeBus.publish(JSON.stringify(storedEvents))
  )

  return {
    ...RPCCall(),
    callback: jest.fn(),
    config: {
      db: {
        appendEvents: jest.spyOn(database, 'appendEvents'),
        getEvents: jest.spyOn(database, 'getEvents'),
        getEventsByStream: jest.spyOn(database, 'getEventsByStream'),
        getEventsByStreamType: jest.spyOn(database, 'getEventsByStreamType'),
      },
      eventsStream,
      onEventsStored,
      isStreamWritable: jest.fn(stream => isStreamWritable(stream)),
    },
    storeBus,
  }
}
