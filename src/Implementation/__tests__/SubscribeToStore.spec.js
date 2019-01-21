import 'jest'
import { every, random, range } from 'lodash'
import uuid from 'uuid'

import { Empty, StoredEvent } from '../../../dist/main'
import { SubscribeToStore } from '../../../dist/main/Implementation/SubscribeToStore'

import Mocks from './Mocks'

describe('SubscribeToStore(config) factory', () => {
  it('is a function', () => {
    expect(typeof SubscribeToStore).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const subscribeToStore = SubscribeToStore(config)
    expect(typeof subscribeToStore).toBe('function')
    expect(subscribeToStore.length).toBe(1)
  })
})

describe('subscribeToStore(call) handler', () => {
  it('calls call.write(storedEventMessage) for every event flowing through the storeBus', done => {
    const { call, callObserver, config, storeBus } = Mocks()
    SubscribeToStore(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    call.emit('data', new Empty())

    const events = range(1, random(2, 5)).map(n => ({
      id: `${n}`,
      stream: {
        id: uuid(),
        type: {
          context: uuid(),
          name: uuid(),
        },
      },
      name: uuid(),
      payload: uuid(),
      storedOn: new Date().toISOString(),
      sequenceNumber: 1,
      correlationId: '',
      transactionId: uuid(),
    }))

    const stringifiedEvents = JSON.stringify(events)

    storeBus.emit('events', stringifiedEvents)

    setTimeout(() => {
      expect(writtenMessages.length).toEqual(events.length)
      expect(
        every(writtenMessages, message => message instanceof StoredEvent)
      ).toBe(true)

      const stringifiedMessages = JSON.stringify(
        writtenMessages.map(message => message.toObject())
      )
      expect(stringifiedMessages).toEqual(stringifiedEvents)

      done()
    }, 1)
  })
  it("when client'stream ends the server'stream ends", done => {
    const { call, callObserver, config, storeBus } = Mocks()
    SubscribeToStore(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    call.emit('data', new Empty())

    const getEvent = n => ({
      id: `${n}`,
      stream: {
        id: uuid(),
        type: {
          context: uuid(),
          name: uuid(),
        },
      },
      name: uuid(),
      payload: uuid(),
      storedOn: new Date().toISOString(),
      sequenceNumber: 1,
      correlationId: '',
      transactionId: uuid(),
    })

    const firstSlot = range(1, 4).map(getEvent)
    const stringifiedFirstSlot = JSON.stringify(firstSlot)
    const secondSlot = range(4, 7).map(getEvent)
    const stringifiedSecondSlot = JSON.stringify(secondSlot)

    storeBus.emit('events', stringifiedFirstSlot)
    call.emit('end')
    storeBus.emit('events', stringifiedSecondSlot)

    setTimeout(() => {
      const stringifiedMessages = JSON.stringify(
        writtenMessages.map(message => message.toObject())
      )
      expect(stringifiedMessages).toEqual(stringifiedFirstSlot)

      done()
    }, 1)
  })
  it("if client'stream ends before sending a subscription request then the server'stream ends", () => {
    const { call, callObserver, config } = Mocks()
    SubscribeToStore(config)(call)

    let serverStreamEnded = false
    callObserver.on('end', () => {
      serverStreamEnded = true
    })

    call.emit('end')
    expect(serverStreamEnded).toBe(true)
  })
})
