import * as GRPC from 'grpc'
import 'jest'
import { every, isEqual, random, range, sample } from 'lodash'
import uuid from 'uuid'

import {
  ReadStreamForwardRequest,
  Stream,
  StreamType,
} from '../../../dist/main'
import { ReadStreamForward } from '../../../dist/main/Implementation/ReadStreamForward'

import Mocks from './Mocks'

describe('ReadStreamForward(config) factory', () => {
  it('is a function', () => {
    expect(typeof ReadStreamForward).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const readStreamForward = ReadStreamForward(config)
    expect(typeof readStreamForward).toBe('function')
    expect(readStreamForward.length).toBe(1)
  })
})

describe('readStreamForward(call) handler', () => {
  it('calls call.write(storedEventMessage) for every fetched event, then calls call.end()', done => {
    const { call, callObserver, config } = Mocks()
    const randomStream = sample(config.storedEvents).stream
    const eventsOfStream = config.storedEvents.filter(({ stream }) =>
      isEqual(stream, randomStream)
    )
    const fromEventIndex = random(0, eventsOfStream.length - 1)
    const fromSequenceNumber = eventsOfStream[fromEventIndex].sequenceNumber
    const limit = random(1, 5)
    const eventsToFetch = eventsOfStream
      .slice(fromEventIndex + 1)
      .slice(0, limit)
    const expectedEventIds = eventsToFetch.map(({ id }) => id)

    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(randomStream.type.context)
    streamTypeMessage.setName(randomStream.type.name)
    const streamMessage = new Stream()
    streamMessage.setId(randomStream.id)
    streamMessage.setType(streamTypeMessage)
    const requestMessage = new ReadStreamForwardRequest()
    requestMessage.setStream(streamMessage)
    requestMessage.setFromSequenceNumber(fromSequenceNumber)
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

    ReadStreamForward(config)(call)
  })

  describe('invocation of db.getEventsByStream({stream, fromSequenceNumber, limit})', () => {
    const streamId = uuid()
    const streamTypeContext = uuid()
    const streamTypeName = uuid()

    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(streamTypeContext)
    streamTypeMessage.setName(streamTypeName)
    const streamMessage = new Stream()
    streamMessage.setId(streamId)
    streamMessage.setType(streamTypeMessage)

    it('happens once', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      expect(config.db.getEventsByStream).toHaveBeenCalledTimes(1)
    })
    it('stream matches call.request.stream', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.stream).toEqual({
        id: streamId,
        type: {
          context: streamTypeContext,
          name: streamTypeName,
        },
      })
    })
    it('fromSequenceNumber matches call.request.fromSequenceNumber', () => {
      const { call, config } = Mocks()
      const expectedSequenceNumber = 10
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      requestMessage.setFromSequenceNumber(expectedSequenceNumber)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.fromSequenceNumber).toBe(expectedSequenceNumber)
    })
    it('if call.request.fromSequenceNumber is < 0, then passed fromSequenceNumber is 0', () => {
      const { call, config } = Mocks()

      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      requestMessage.setFromSequenceNumber(-10)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.fromSequenceNumber).toBe(0)
    })
    it('limit matches call.request.limit', () => {
      const { call, config } = Mocks()
      const expectedLimit = 10
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      requestMessage.setLimit(expectedLimit)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(expectedLimit)
    })
    it('if call.request.limit is === 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      requestMessage.setLimit(0)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(undefined)
    })
    it('if call.request.limit is < 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(streamMessage)
      requestMessage.setLimit(-10)
      call.request = requestMessage

      ReadStreamForward(config)(call)

      const dbCallInput = config.db.getEventsByStream.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(undefined)
    })
  })
  describe('cases of `error` emission on call', () => {
    it('if call.request.stream is missing: {code: GRPC.status.INVALID_ARGUMENT, name: `STREAM_NOT_PROVIDED`}', done => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamForwardRequest()
      call.request = requestMessage

      call.on('error', error => {
        expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
        expect(error.name).toBe('STREAM_NOT_PROVIDED')
        done()
      })

      ReadStreamForward(config)(call)
    })
    it('if call.request.stream.type is missing: {code: GRPC.status.INVALID_ARGUMENT, name: `STREAM_TYPE_NOT_PROVIDED`}', done => {
      const { call, config } = Mocks()
      const stream = new Stream()
      stream.setId('xxx')
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(stream)
      call.request = requestMessage

      call.on('error', error => {
        expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
        expect(error.name).toBe('STREAM_TYPE_NOT_PROVIDED')
        done()
      })

      ReadStreamForward(config)(call)
    })
    it('if call.request.stream.type is not valid: {code: GRPC.status.INVALID_ARGUMENT, name: `STREAM_TYPE_NOT_VALID`}', done => {
      const { call, config } = Mocks()
      const streamType = new StreamType()
      streamType.setContext('AContext')
      streamType.setName('   ')
      const stream = new Stream()
      stream.setId('xxx')
      stream.setType(streamType)
      const requestMessage = new ReadStreamForwardRequest()
      requestMessage.setStream(stream)
      call.request = requestMessage

      call.on('error', error => {
        expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
        expect(error.name).toBe('STREAM_TYPE_NOT_VALID')
        done()
      })

      ReadStreamForward(config)(call)
    })
  })
})
