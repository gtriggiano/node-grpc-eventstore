import * as GRPC from 'grpc'
import 'jest'
import { isEqual, random, sample } from 'lodash'
import uuid from 'uuid'

import { ReadStreamTypeForwardRequest, StreamType } from '../../../dist/main'
import { ReadStreamTypeForward } from '../../../dist/main/Implementation/ReadStreamTypeForward'

import Mocks from './Mocks'

describe('ReadStreamTypeForward(config) factory', () => {
  it('is a function', () => {
    expect(typeof ReadStreamTypeForward).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const { config } = Mocks()
    const readStreamTypeForward = ReadStreamTypeForward(config)
    expect(typeof readStreamTypeForward).toBe('function')
    expect(readStreamTypeForward.length).toBe(1)
  })
})

describe('readStreamTypeForward(call) handler', () => {
  it('calls call.write(storedEventMessage) for every fetched event, then calls call.end()', done => {
    const { call, callObserver, config } = Mocks()
    const randomStreamType = sample(config.storedEvents).stream.type
    const eventsOfStreamType = config.storedEvents.filter(
      ({ stream: { type } }) => isEqual(type, randomStreamType)
    )
    const fromEventIndex = random(0, eventsOfStreamType.length - 1)
    const fromEventId = eventsOfStreamType[fromEventIndex].id
    const limit = random(1, 5)
    const eventsToFetch = eventsOfStreamType
      .slice(fromEventIndex + 1)
      .slice(0, limit)
    const expectedEventIds = eventsToFetch.map(({ id }) => id)

    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(randomStreamType.context)
    streamTypeMessage.setName(randomStreamType.name)
    const requestMessage = new ReadStreamTypeForwardRequest()
    requestMessage.setStreamType(streamTypeMessage)
    requestMessage.setFromEventId(fromEventId)
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

    ReadStreamTypeForward(config)(call)
  })

  describe('invocation of db.getEventsByStreamType({streamType, fromEventId, limit})', () => {
    const streamTypeContext = uuid()
    const streamTypeName = uuid()

    const streamTypeMessage = new StreamType()
    streamTypeMessage.setContext(streamTypeContext)
    streamTypeMessage.setName(streamTypeName)

    it('happens once', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      expect(config.db.getEventsByStreamType).toHaveBeenCalledTimes(1)
    })
    it('streamType matches call.request.streamType', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.streamType).toEqual({
        context: streamTypeContext,
        name: streamTypeName,
      })
    })
    it('fromEventId is a string representation of call.request.fromEventId', () => {
      const { call, config } = Mocks()
      const expectedFromEventId = 10
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      requestMessage.setFromEventId(expectedFromEventId)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.fromEventId).toBe(`${expectedFromEventId}`)
    })
    it('if call.request.fromEventId is < 0, then passed fromEventId is "0"', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      requestMessage.setFromEventId(-10)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.fromEventId).toBe('0')
    })
    it('limit matches call.request.limit', () => {
      const { call, config } = Mocks()
      const expectedLimit = 10
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      requestMessage.setLimit(expectedLimit)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(expectedLimit)
    })
    it('if call.request.limit is === 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      requestMessage.setLimit(0)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(undefined)
    })
    it('if call.request.limit is < 0, then passed limit is "undefined"', () => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      requestMessage.setLimit(-10)
      call.request = requestMessage

      ReadStreamTypeForward(config)(call)

      const dbCallInput = config.db.getEventsByStreamType.mock.calls[0][0]
      expect(dbCallInput.limit).toBe(undefined)
    })
  })
  describe('cases of `error` emission on call', () => {
    it('if call.request.streamType is missing: {code: GRPC.status.INVALID_ARGUMENT, name: `STREAM_TYPE_NOT_PROVIDED`}', done => {
      const { call, config } = Mocks()
      const requestMessage = new ReadStreamTypeForwardRequest()
      call.request = requestMessage

      call.on('error', error => {
        expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
        expect(error.name).toBe('STREAM_TYPE_NOT_PROVIDED')
        done()
      })

      ReadStreamTypeForward(config)(call)
    })
    it('if call.request.streamType is not valid: {code: GRPC.status.INVALID_ARGUMENT, name: `STREAM_TYPE_NOT_VALID`}', done => {
      const { call, config } = Mocks()
      const streamTypeMessage = new StreamType()
      streamTypeMessage.setContext('AContext')
      streamTypeMessage.setName('   ')
      const requestMessage = new ReadStreamTypeForwardRequest()
      requestMessage.setStreamType(streamTypeMessage)
      call.request = requestMessage

      call.on('error', error => {
        expect(error.code).toBe(GRPC.status.INVALID_ARGUMENT)
        expect(error.name).toBe('STREAM_TYPE_NOT_VALID')
        done()
      })

      ReadStreamTypeForward(config)(call)
    })
  })
})
