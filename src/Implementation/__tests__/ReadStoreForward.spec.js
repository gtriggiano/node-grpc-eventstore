import 'jest'
import { every, random, range, sample } from 'lodash'
import uuid from 'uuid'

import { ReadStoreForwardRequest } from '../../../dist/main'
import { ReadStoreForward } from '../../../dist/main/Implementation/ReadStoreForward'

import Mocks from './Mocks'

describe('ReadStoreForward(config) factory', () => {
  it('is a function', () => {
    expect(typeof ReadStoreForward).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const readStoreForward = ReadStoreForward(config)
    expect(typeof readStoreForward).toBe('function')
    expect(readStoreForward.length).toBe(1)
  })
})

describe('readStoreForward(call) handler', () => {
  it('calls call.write(storedEventMessage) for every fetched event, then calls call.end()', done => {
    const { call, callObserver, config } = Mocks()
    const fromEventIndex = random(0, config.storedEvents.length - 1)
    const fromEvent = config.storedEvents[fromEventIndex]
    const limit = random(1, 5)
    const eventsToFetch = config.storedEvents
      .slice(fromEventIndex + 1)
      .slice(0, limit)
    const expectedEventIds = eventsToFetch.map(({ id }) => id)

    const requestMessage = new ReadStoreForwardRequest()
    requestMessage.setFromEventId(fromEvent.id)
    requestMessage.setLimit(limit)

    call.request = requestMessage

    const receivedEventsIds = []
    callObserver.on('write', storedEventMessage => {
      const storedEvent = storedEventMessage.toObject()
      // console.log('storedEvent :', storedEvent)
      receivedEventsIds.push(storedEvent.id)
    })
    callObserver.on('end', () => {
      expect(receivedEventsIds).toEqual(expectedEventIds)
      done()
    })

    ReadStoreForward(config)(call)
  })
  describe('invocation of db.getEvents({fromEventId, limit})', () => {
    it('it happens once', () => {
      const { call, config } = Mocks()

      const requestMessage = new ReadStoreForwardRequest()
      requestMessage.setLimit(random(1, 10))
      requestMessage.setFromEventId('0')

      call.request = requestMessage

      ReadStoreForward(config)(call)

      expect(config.db.getEvents).toHaveBeenCalledTimes(1)
    })
    it('fromEventId is the correct string representation of call.request.fromEventId', () => {
      const { call, config } = Mocks()

      const fromEventId = random(10, 100)
      const limit = random(1, 10)

      const requestMessage = new ReadStoreForwardRequest()
      requestMessage.setFromEventId(fromEventId)
      requestMessage.setLimit(limit)

      call.request = requestMessage

      ReadStoreForward(config)(call)

      expect(config.db.getEvents).toHaveBeenCalledWith({
        fromEventId: `${fromEventId}`,
        limit,
      })
    })
    it('if call.request.fromEventId is < 0, then passed fromEventId is "0"', () => {
      const { call, config } = Mocks()

      const fromEventId = random(-100, -10)
      const limit = random(1, 10)

      const requestMessage = new ReadStoreForwardRequest()
      requestMessage.setFromEventId(fromEventId)
      requestMessage.setLimit(limit)

      call.request = requestMessage

      ReadStoreForward(config)(call)

      expect(config.db.getEvents).toHaveBeenCalledWith({
        fromEventId: '0',
        limit,
      })
    })
    it('if call.request.limit is === 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()

      const fromEventId = 10

      const requestMessage = new ReadStoreForwardRequest()
      requestMessage.setFromEventId(fromEventId)
      requestMessage.setLimit(0)

      call.request = requestMessage

      ReadStoreForward(config)(call)

      expect(config.db.getEvents).toHaveBeenCalledWith({
        fromEventId: `${fromEventId}`,
        limit: undefined,
      })
    })
    it('if call.request.limit is < 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()

      const fromEventId = 10
      const limit = random(-10, -1)

      const requestMessage = new ReadStoreForwardRequest()
      requestMessage.setFromEventId(fromEventId)
      requestMessage.setLimit(limit)

      call.request = requestMessage

      ReadStoreForward(config)(call)

      expect(config.db.getEvents).toHaveBeenCalledWith({
        fromEventId: `${fromEventId}`,
        limit: undefined,
      })
    })
  })
})
