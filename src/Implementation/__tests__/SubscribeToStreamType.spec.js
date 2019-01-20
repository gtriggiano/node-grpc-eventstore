import 'jest'
import * as GRPC from 'grpc'
import { every, random, range, sample } from 'lodash'
import uuid from 'uuid'

import {
  SubscribeToStreamTypeRequest,
  StoredEvent,
  StreamType,
} from '../../../dist/main'
import { SubscribeToStreamType } from '../../../dist/main/Implementation/SubscribeToStreamType'

import Mocks from './Mocks'

describe('SubscribeToStreamType(config) factory', () => {
  it('is a function', () => {
    expect(typeof SubscribeToStreamType).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const subscribeToStreamType = SubscribeToStreamType(config)
    expect(typeof subscribeToStreamType).toBe('function')
    expect(subscribeToStreamType.length).toBe(1)
  })
})

describe('subscribeToStreamType(call) handler', () => {
  it('emits `error` on call if stream type is not provided', done => {
    const { call, config } = Mocks()
    SubscribeToStreamType(config)(call)

    call.on('error', error => {
      expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
      expect(error.message).toBe('STREAM_TYPE_NOT_PROVIDED')
      expect(error.name).toBe('STREAM_TYPE_NOT_PROVIDED')
      done()
    })

    const subscribeRequestMessage = new SubscribeToStreamTypeRequest()
    call.emit('data', subscribeRequestMessage)
  })
  it('emits `error` on call if stream type is not valid', done => {
    const { call, config } = Mocks()
    SubscribeToStreamType(config)(call)

    call.on('error', error => {
      expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
      expect(error.message).toBe('STREAM_TYPE_NOT_VALID')
      expect(error.name).toBe('STREAM_TYPE_NOT_VALID')
      done()
    })

    const subscribeRequestMessage = new SubscribeToStreamTypeRequest()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(uuid())
    subscribeRequestMessage.setStreamType(streamTypeMessage)
    call.emit('data', subscribeRequestMessage)
  })
  it('calls call.write(storedEventMessage) for every matching event flowing through the storeBus', done => {
    const { call, callObserver, config, storeBus } = Mocks()
    SubscribeToStreamType(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    const observedStreamType = {
      context: uuid(),
      name: uuid(),
    }
    const anotherStreamType = {
      context: uuid(),
      name: uuid(),
    }

    const subscribeRequestMessage = new SubscribeToStreamTypeRequest()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(observedStreamType.context)
    streamTypeMessage.setName(observedStreamType.name)
    subscribeRequestMessage.setStreamType(streamTypeMessage)
    call.emit('data', subscribeRequestMessage)

    const events = range(1, 20).map(n => ({
      id: `${n}`,
      stream: {
        id: uuid(),
        type:
          n > 1
            ? sample([observedStreamType, anotherStreamType])
            : observedStreamType,
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
      const expectedEvents = events.filter(
        ({ stream }) => stream.type.context === observedStreamType.context
      )
      const stringifiedExpectedEvents = JSON.stringify(expectedEvents)
      expect(writtenMessages.length).toEqual(expectedEvents.length)
      expect(
        every(writtenMessages, message => message instanceof StoredEvent)
      ).toBe(true)

      const stringifiedMessages = JSON.stringify(
        writtenMessages.map(message => message.toObject())
      )
      expect(stringifiedMessages).toEqual(stringifiedExpectedEvents)

      done()
    }, 1)
  })
  it("when client'stream ends the server'stream ends", done => {
    const { call, callObserver, config, storeBus } = Mocks()
    SubscribeToStreamType(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    const observedStreamType = {
      context: uuid(),
      name: uuid(),
    }
    const anotherStreamType = {
      context: uuid(),
      name: uuid(),
    }

    const subscribeRequestMessage = new SubscribeToStreamTypeRequest()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(observedStreamType.context)
    streamTypeMessage.setName(observedStreamType.name)
    subscribeRequestMessage.setStreamType(streamTypeMessage)
    call.emit('data', subscribeRequestMessage)

    const firstSlotEvents = range(1, 4).map(n => ({
      id: `${n}`,
      stream: {
        id: uuid(),
        type:
          n > 1
            ? sample([observedStreamType, anotherStreamType])
            : observedStreamType,
      },
      name: uuid(),
      payload: uuid(),
      storedOn: new Date().toISOString(),
      sequenceNumber: 1,
      correlationId: '',
      transactionId: uuid(),
    }))
    const secondSlotEvents = range(5, 10).map(n => ({
      id: `${n}`,
      stream: {
        id: uuid(),
        type:
          n > 5
            ? sample([observedStreamType, anotherStreamType])
            : observedStreamType,
      },
      name: uuid(),
      payload: uuid(),
      storedOn: new Date().toISOString(),
      sequenceNumber: 1,
      correlationId: '',
      transactionId: uuid(),
    }))

    const stringifiedFirstSlotEvents = JSON.stringify(firstSlotEvents)
    const stringifiedSecondSlotEvents = JSON.stringify(secondSlotEvents)

    storeBus.emit('events', stringifiedFirstSlotEvents)
    call.emit('end')
    storeBus.emit('events', stringifiedSecondSlotEvents)

    setTimeout(() => {
      const expectedEvents = firstSlotEvents.filter(
        ({ stream }) => stream.type.context === observedStreamType.context
      )
      const stringifiedExpectedEvents = JSON.stringify(expectedEvents)
      expect(writtenMessages.length).toEqual(expectedEvents.length)
      const stringifiedMessages = JSON.stringify(
        writtenMessages.map(message => message.toObject())
      )
      expect(stringifiedMessages).toEqual(stringifiedExpectedEvents)

      done()
    }, 1)
  })
})
