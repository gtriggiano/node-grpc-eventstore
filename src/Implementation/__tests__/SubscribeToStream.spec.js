import 'jest'
import * as GRPC from 'grpc'
import { every, random, range, sample } from 'lodash'
import uuid from 'uuid'

import {
  SubscribeToStreamRequest,
  StoredEvent,
  Stream,
  StreamType,
} from '../../../dist/main'
import { SubscribeToStream } from '../../../dist/main/Implementation/SubscribeToStream'

import Mocks from './Mocks'

describe('SubscribeToStream(config) factory', () => {
  it('is a function', () => {
    expect(typeof SubscribeToStream).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const subscribeToStream = SubscribeToStream(config)
    expect(typeof subscribeToStream).toBe('function')
    expect(subscribeToStream.length).toBe(1)
  })
})

describe('subscribeToStream(call) handler', () => {
  it('emits `error` on call if stream is not provided', done => {
    const { call, config } = Mocks()
    SubscribeToStream(config)(call)

    call.on('error', error => {
      expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
      expect(error.message).toBe('STREAM_NOT_PROVIDED')
      expect(error.name).toBe('STREAM_NOT_PROVIDED')
      done()
    })

    const subscribeRequestMessage = new SubscribeToStreamRequest()
    call.emit('data', subscribeRequestMessage)
  })
  it("emits `error` on call if provided stream's type is missing", done => {
    const { call, config } = Mocks()
    SubscribeToStream(config)(call)

    call.on('error', error => {
      expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
      expect(error.message).toBe('STREAM_TYPE_NOT_PROVIDED')
      expect(error.name).toBe('STREAM_TYPE_NOT_PROVIDED')
      done()
    })

    const subscribeRequestMessage = new SubscribeToStreamRequest()
    const streamMessage = new Stream()
    subscribeRequestMessage.setStream(streamMessage)
    call.emit('data', subscribeRequestMessage)
  })
  it("emits `error` on call if provided stream's type is not valid", done => {
    const { call, config } = Mocks()
    SubscribeToStream(config)(call)

    call.on('error', error => {
      expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
      expect(error.message).toBe('STREAM_TYPE_NOT_VALID')
      expect(error.name).toBe('STREAM_TYPE_NOT_VALID')
      done()
    })

    const subscribeRequestMessage = new SubscribeToStreamRequest()
    const streamMessage = new Stream()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(uuid())
    streamTypeMessage.setName('  ')
    streamMessage.setType(streamTypeMessage)
    subscribeRequestMessage.setStream(streamMessage)
    call.emit('data', subscribeRequestMessage)
  })
  it('calls call.write(storedEventMessage) for every matching event flowing through the storeBus', done => {
    const { call, callObserver, config, storeBus } = Mocks()
    SubscribeToStream(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    const observedStream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }
    const anotherStream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }

    const subscribeRequestMessage = new SubscribeToStreamRequest()
    const streamMessage = new Stream()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(observedStream.type.context)
    streamTypeMessage.setName(observedStream.type.name)
    streamMessage.setId(observedStream.id)
    streamMessage.setType(streamTypeMessage)
    subscribeRequestMessage.setStream(streamMessage)
    call.emit('data', subscribeRequestMessage)

    const events = range(1, random(10, 20)).map(n => ({
      id: `${n}`,
      stream: n > 1 ? sample([observedStream, anotherStream]) : observedStream,
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
        ({ stream }) => stream.id === observedStream.id
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
    SubscribeToStream(config)(call)

    const writtenMessages = []
    callObserver.on('write', message => writtenMessages.push(message))

    const observedStream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }
    const anotherStream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }

    const subscribeRequestMessage = new SubscribeToStreamRequest()
    const streamMessage = new Stream()
    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(observedStream.type.context)
    streamTypeMessage.setName(observedStream.type.name)
    streamMessage.setId(observedStream.id)
    streamMessage.setType(streamTypeMessage)
    subscribeRequestMessage.setStream(streamMessage)
    call.emit('data', subscribeRequestMessage)

    const firstSlotEvents = range(1, 4).map(n => ({
      id: `${n}`,
      stream: n > 1 ? sample([observedStream, anotherStream]) : observedStream,
      name: uuid(),
      payload: uuid(),
      storedOn: new Date().toISOString(),
      sequenceNumber: 1,
      correlationId: '',
      transactionId: uuid(),
    }))
    const secondSlotEvents = range(5, 10).map(n => ({
      id: `${n}`,
      stream: n > 5 ? sample([observedStream, anotherStream]) : observedStream,
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
        ({ stream }) => stream.id === observedStream.id
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
