import 'jest'

import { Implementation } from '../../../dist/main/Implementation'

import Mocks from './Mocks'

describe('Implementation(configuration) factory', () => {
  it('is a function', () => {
    expect(typeof Implementation).toBe('function')
  })
  it('returns an object', () => {
    const { config } = Mocks()
    const impl = Implementation(config)
    expect(typeof impl).toBe('object')
  })
})

describe('implementation properties', () => {
  const { config } = Mocks()
  const {
    appendEventsToMultipleStreams,
    appendEventsToStream,
    catchUpWithStore,
    catchUpWithStream,
    catchUpWithStreamType,
    heartbeat,
    ping,
    readStoreForward,
    readStreamForward,
    readStreamTypeForward,
    subscribeToStore,
    subscribeToStream,
    subscribeToStreamType,
  } = Implementation(config)

  it('appendEventsToMultipleStreams(call, callback) is a function', () => {
    expect(typeof appendEventsToMultipleStreams).toBe('function')
    expect(appendEventsToMultipleStreams.length).toBe(2)
  })
  it('appendEventsToStream(call, callback) is a function', () => {
    expect(typeof appendEventsToStream).toBe('function')
    expect(appendEventsToStream.length).toBe(2)
  })
  it('catchUpWithStore(call) is a function', () => {
    expect(typeof catchUpWithStore).toBe('function')
    expect(catchUpWithStore.length).toBe(1)
  })
  it('catchUpWithStream(call) is a function', () => {
    expect(typeof catchUpWithStream).toBe('function')
    expect(catchUpWithStream.length).toBe(1)
  })
  it('catchUpWithStreamType(call) is a function', () => {
    expect(typeof catchUpWithStreamType).toBe('function')
    expect(catchUpWithStreamType.length).toBe(1)
  })
  it('heartbeat(call) is a function', () => {
    expect(typeof heartbeat).toBe('function')
    expect(heartbeat.length).toBe(1)
  })
  it('ping(call, callback) is a function', () => {
    expect(typeof ping).toBe('function')
    expect(ping.length).toBe(2)
  })
  it('readStoreForward(call) is a function', () => {
    expect(typeof readStoreForward).toBe('function')
    expect(readStoreForward.length).toBe(1)
  })
  it('readStreamForward(call) is a function', () => {
    expect(typeof readStreamForward).toBe('function')
    expect(readStreamForward.length).toBe(1)
  })
  it('readStreamTypeForward(call) is a function', () => {
    expect(typeof readStreamTypeForward).toBe('function')
    expect(readStreamTypeForward.length).toBe(1)
  })
  it('subscribeToStore(call) is a function', () => {
    expect(typeof subscribeToStore).toBe('function')
    expect(subscribeToStore.length).toBe(1)
  })
  it('subscribeToStream(call) is a function', () => {
    expect(typeof subscribeToStream).toBe('function')
    expect(subscribeToStream.length).toBe(1)
  })
  it('subscribeToStreamType(call) is a function', () => {
    expect(typeof subscribeToStreamType).toBe('function')
    expect(subscribeToStreamType.length).toBe(1)
  })
})
