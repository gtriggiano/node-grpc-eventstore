/* global describe it */
import fs from 'fs'
import path from 'path'
import should from 'should/as-function'
import EventEmitter from 'eventemitter3'
import uuid from 'uuid'
import { random, map, sample, pick, every, isString, uniq } from 'lodash'

const codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
const { default: InMemoryAdapter } = require(path.resolve(
  codeFolder,
  'InMemoryAdapter',
))
const {
  ANY_SEQUENCE_NUMBER,
  ANY_POSITIVE_SEQUENCE_NUMBER,
} = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'Implementation',
  'AppendEventsToStream',
))

const JSON_FILE = path.resolve(__dirname, 'events.json')
const events = require(JSON_FILE)
const streams = map(
  events.reduce((streamsById, event) => {
    streamsById[event.stream.id] = streamsById[event.stream.id] || {
      id: event.stream.id,
      type: { ...event.stream.type },
      version: 0,
      eventIds: [],
    }
    streamsById[event.stream.id].version++
    streamsById[event.stream.id].eventIds.push(event.id)
    return streamsById
  }, {}),
)
const streamTypes = map(
  streams.reduce((typesBySerial, stream) => {
    let serial = `${stream.type.context}:${stream.type.name}`
    typesBySerial[serial] = typesBySerial[serial] || {
      ...stream.type,
      totalEvents: 0,
      eventIds: [],
    }
    typesBySerial[serial].totalEvents += stream.version
    typesBySerial[serial].eventIds = typesBySerial[serial].eventIds.concat(
      stream.eventIds,
    )
    typesBySerial[serial].eventIds.sort()
    return typesBySerial
  }, {}),
)

const getAdapter = (JSONFile) => InMemoryAdapter(JSONFile ? { JSONFile } : {})

describe('lib/InMemoryAdapter([config])', () => {
  it('is a function', () => should(InMemoryAdapter).be.a.Function())
  it('passing `config` is optional', () => {
    should(() => {
      InMemoryAdapter()
    }).not.throw()
  })
  it('throws if config.JSONFile is truthy and is not a path to a file', () => {
    should(() => {
      InMemoryAdapter({ JSONFile: 'notexist' })
    }).throw(
      new RegExp(
        'config.JSONFile MUST be either falsy or a path of a json file containing a list of events',
      ),
    )
    should(() => {
      InMemoryAdapter({ JSONFile: JSON_FILE })
    }).not.throw()
  })

  describe('db = InMemoryAdapter()', () => {
    it('is an event emitter', () =>
      should(InMemoryAdapter()).be.an.instanceOf(EventEmitter))
    it('db.getEvents() is a function', () =>
      should(InMemoryAdapter().getEvents).be.a.Function())
    it('db.getEventsByStream() is a function', () =>
      should(InMemoryAdapter().getEventsByStream).be.a.Function())
    it('db.getEventsByStreamType() is a function', () =>
      should(InMemoryAdapter().getEventsByStreamType).be.a.Function())
    it('db.appendEvents() is a function', () =>
      should(InMemoryAdapter().appendEvents).be.a.Function())
    it('emits `update` when new events are appended to the store', (done) => {
      let db = getAdapter(JSON_FILE)

      let transactionId = uuid()
      let stream = {
        id: uuid(),
        type: {
          context: uuid(),
          name: uuid(),
        },
      }

      let initialEvents = db.events

      db.on('update', () => {
        try {
          let finalEvents = db.events
          should(finalEvents.length).equal(initialEvents.length + 2)
          done()
        } catch (e) {
          done(e)
        }
      })

      db.appendEvents({
        appendRequests: [
          {
            stream: stream,
            events: [{ type: uuid(), data: '' }, { type: uuid(), data: '' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
        transactionId,
      })
    })
    it('db.events is a getter for the list of events in memory', () => {
      let db = getAdapter(JSON_FILE)
      should(db.events).eql(events)
    })

    describe('results = db.getEvents({fromEventId [, limit]})', () => {
      it('is an event emitter', () => {
        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: '0' })
        should(results).be.an.instanceOf(EventEmitter)
      })
      it('emits (`event`, event) for each event fetched and then emits `end`', (done) => {
        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: '0' })
        let expectedEventsIds = events.map(({ id }) => id)
        let fetchedEventsIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventsIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventsIds).eql(expectedEventsIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('for every event emitted the .correlationId is always a string', (done) => {
        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: '0' })

        let fetchedEventsCorrelationId = []
        results.on('error', done)
        results.on('event', (event) =>
          fetchedEventsCorrelationId.push(event.correlationId),
        )
        results.on('end', () => {
          try {
            should(every(fetchedEventsCorrelationId, isString)).be.True()
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just `end` if no events are found', (done) => {
        let db = getAdapter()
        let results = db.getEvents({ fromEventId: '0' })

        results.on('error', done)
        results.on('event', (event) => done(new Error()))
        results.on('end', () => done())
      })
      it('emits the events ordered by `id`', (done) => {
        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: '0' })

        let fetchedEvents = []
        results.on('error', done)
        results.on('event', (event) => fetchedEvents.push(event))
        results.on('end', () => {
          try {
            let idList = fetchedEvents.map(({ id }) => id)
            let sortedIdList = idList.slice().sort()
            should(idList).eql(sortedIdList)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just events with `id` > `fromEventId`', (done) => {
        let splitEventIndex = random(events.length - 2)
        let splitEvent = events[splitEventIndex]
        let expectedEventsIds = events
          .slice(splitEventIndex + 1)
          .map(({ id }) => id)

        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: splitEvent.id })

        let fetchedEventsIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventsIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventsIds).eql(expectedEventsIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('takes in to account `limit` param if provided', (done) => {
        let limit = random(1, 20)
        let splitEventIndex = random(events.length - 40)
        let splitEvent = events[splitEventIndex]
        let expectedEventsIds = events
          .slice(splitEventIndex + 1, splitEventIndex + 1 + limit)
          .map(({ id }) => id)

        let db = getAdapter(JSON_FILE)
        let results = db.getEvents({ fromEventId: splitEvent.id, limit: limit })

        let fetchedEventsIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventsIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventsIds).eql(expectedEventsIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    })

    describe('results = db.getEventsByStream({stream, fromSequenceNumber [, limit]})', () => {
      it('is an event emitter', (done) => {
        let db = getAdapter(JSON_FILE)
        let stream = sample(streams)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: 0,
        })

        should(results).be.an.instanceOf(EventEmitter)
        results.on('error', done)
        results.on('end', () => done())
      })
      it('emits `event` for each event fetched and then emits `end`', (done) => {
        let stream = sample(streams)
        let db = getAdapter(JSON_FILE)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: 0,
        })

        let totalFetchedEvents = 0
        results.on('error', done)
        results.on('event', (event) => totalFetchedEvents++)
        results.on('end', () => {
          try {
            should(totalFetchedEvents).equal(stream.version)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('for every event emitted the .correlationId is always a string', (done) => {
        let stream = sample(streams)
        let db = getAdapter(JSON_FILE)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: 0,
        })

        let fetchedEventsCorrelationIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventsCorrelationIds.push(event.id))
        results.on('end', () => {
          try {
            should(every(fetchedEventsCorrelationIds, isString)).be.True()
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just `end` if no events are found', (done) => {
        let db = getAdapter(JSON_FILE)
        let stream = {
          ...sample(streams),
          id: 'notexistent',
        }
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: 0,
        })

        let totalFetchedEvents = 0
        results.on('event', (event) => totalFetchedEvents++)
        results.on('end', () => {
          should(totalFetchedEvents).equal(0)
          done()
        })
      })
      it('emits the events ordered by `id`', (done) => {
        let stream = sample(streams)
        let db = getAdapter(JSON_FILE)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: 0,
        })

        let fetchedEventsIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventsIds.push(event.id))
        results.on('end', () => {
          try {
            let sortedIdList = fetchedEventsIds.slice().sort()
            should(fetchedEventsIds).eql(sortedIdList)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just events with `sequenceNumber` > `fromSequenceNumber`', (done) => {
        let stream = sample(streams)
        let fromSequenceNumber = random(stream.version)
        let totalExpectedEvents = stream.version - fromSequenceNumber

        let db = getAdapter(JSON_FILE)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: fromSequenceNumber,
        })

        let totalFetchedEvents = 0
        results.on('error', done)
        results.on('event', (event) => totalFetchedEvents++)
        results.on('end', () => {
          try {
            should(totalFetchedEvents).eql(totalExpectedEvents)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('takes in to account `limit` param if provided', (done) => {
        let stream = sample(streams)
        let limit = random(1, stream.version)
        let fromSequenceNumber = random(0, Math.floor(stream.version * 0.5))
        let totalExpectedEvents = Math.min(
          stream.version - fromSequenceNumber,
          limit,
        )

        let db = getAdapter(JSON_FILE)
        let results = db.getEventsByStream({
          stream: stream,
          fromSequenceNumber: fromSequenceNumber,
          limit: limit,
        })

        let totalFetchedEvents = 0
        results.on('error', done)
        results.on('event', (event) => totalFetchedEvents++)
        results.on('end', () => {
          try {
            should(totalFetchedEvents).equal(totalExpectedEvents)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    })

    describe('results = db.getEventsByStreamType({streamType, fromEventId, [, limit]})', () => {
      it('is an event emitter', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: streamType.eventIds[0],
        })
        should(results).be.an.instanceOf(EventEmitter)
        results.on('error', done)
        results.on('end', () => done())
      })
      it('emits `event` for each event fetched and then emits `end`', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let fromEventIdIndex = random(0, streamType.totalEvents - 1)
        let fromEventId = streamType.eventIds[fromEventIdIndex]
        let extectedEventIds = streamType.eventIds.slice(fromEventIdIndex + 1)
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: fromEventId,
        })

        let fetchedEventIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventIds).eql(extectedEventIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('for every event emitted the .correlationId is always a string', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let fromEventIdIndex = random(0, streamType.totalEvents - 1)
        let fromEventId = streamType.eventIds[fromEventIdIndex]
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: fromEventId,
        })

        let fetchedEventCorrelationIds = []
        results.on('error', done)
        results.on('event', (event) =>
          fetchedEventCorrelationIds.push(event.correlationId),
        )
        results.on('end', () => {
          try {
            should(every(fetchedEventCorrelationIds, isString)).be.True()
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just `end` if no events are found', (done) => {
        let db = getAdapter()
        let streamType = {
          ...sample(streamTypes),
          name: 'notexistent',
        }
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: '0000000000',
        })

        let totalFetchedEvents = 0
        results.on('error', done)
        results.on('event', (event) => totalFetchedEvents++)
        results.on('end', () => {
          try {
            should(totalFetchedEvents).equal(0)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits the events ordered by `id`', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let fromEventIdIndex = random(0, streamType.totalEvents - 1)
        let fromEventId = streamType.eventIds[fromEventIdIndex]
        let extectedEventIds = streamType.eventIds.slice(fromEventIdIndex + 1)
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: fromEventId,
        })

        let fetchedEventIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventIds).eql(extectedEventIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits just events with `id` > `fromEventId`', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let fromEventIdIndex = random(0, streamType.totalEvents - 1)
        let fromEventId = streamType.eventIds[fromEventIdIndex]
        let extectedEventIds = streamType.eventIds.slice(fromEventIdIndex + 1)
        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: fromEventId,
        })

        let fetchedEventIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventIds).eql(extectedEventIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('takes in to account `limit` param if provided', (done) => {
        let db = getAdapter(JSON_FILE)
        let streamType = sample(streamTypes)
        let fromEventIdIndex = random(0, streamType.totalEvents - 2)
        let fromEventId = streamType.eventIds[fromEventIdIndex]
        let extectedEventIds = streamType.eventIds.slice(fromEventIdIndex + 1)
        let limit = random(1, extectedEventIds.length)
        extectedEventIds = extectedEventIds.slice(0, limit)

        let results = db.getEventsByStreamType({
          streamType: streamType,
          fromEventId: fromEventId,
          limit: limit,
        })

        let fetchedEventIds = []
        results.on('error', done)
        results.on('event', (event) => fetchedEventIds.push(event.id))
        results.on('end', () => {
          try {
            should(fetchedEventIds).eql(extectedEventIds)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    })

    describe('results = db.appendEvents({appendRequests, transactionId, correlationId})', () => {
      it('is an event emitter', () => {
        let db = getAdapter()
        let results = db.appendEvents({
          appendRequests: [],
          transactionId: uuid(),
        })
        should(results).be.an.instanceOf(EventEmitter)
      })
      it('emits `stored-events` with a list of created events, ordered by id ASC', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = random(100) > 50 ? uuid() : null

        let stream1 = sample(streams)
        let stream2 = sample(streams)
        while (stream1 === stream2) {
          stream2 = sample(streams)
        }

        let stream1Version = stream1.version
        let stream2Version = stream2.version
        stream1 = pick(stream1, ['id', 'type'])
        stream2 = pick(stream2, ['id', 'type'])

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: stream1,
              events: [
                { type: 'ThisHappened', data: 'one' },
                { type: 'ThatHappened', data: 'two' },
              ],
              expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
            },
            {
              stream: stream2,
              events: [
                { type: 'ThisHappened', data: 'one' },
                { type: 'ThatHappened', data: 'two' },
              ],
              expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', done)
        results.on('stored-events', (storedEvents) => {
          try {
            should(storedEvents).containDeepOrdered([
              {
                stream: stream1,
                type: 'ThisHappened',
                data: 'one',
                sequenceNumber: stream1Version + 1,
                transactionId,
                correlationId: correlationId || '',
              },
              {
                stream: stream1,
                type: 'ThatHappened',
                data: 'two',
                sequenceNumber: stream1Version + 2,
                transactionId,
                correlationId: correlationId || '',
              },
              {
                stream: stream2,
                type: 'ThisHappened',
                data: 'one',
                sequenceNumber: stream2Version + 1,
                transactionId,
                correlationId: correlationId || '',
              },
              {
                stream: stream2,
                type: 'ThatHappened',
                data: 'two',
                sequenceNumber: stream2Version + 2,
                transactionId,
                correlationId: correlationId || '',
              },
            ])

            should(
              every(storedEvents, ({ id }) => isString(id) && /^\d+$/.test(id)),
            ).be.True('Events ids are string representations of integers')
            should(
              every(
                storedEvents,
                ({ storedOn }) =>
                  isString(storedOn) &&
                  new Date(storedOn).toISOString() === storedOn,
              ),
            ).be.True('event.storedOn is a string representing a valid date')

            let eventsIds = storedEvents.map(({ id }) => id)
            should(eventsIds).eql(eventsIds.slice().sort())
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('for every event carried in the `stored-events` event payolad .correlationId is always a string', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = null

        let stream = sample(streams)
        stream = pick(stream, ['id', 'type'])

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: stream,
              events: [
                { type: 'ThisHappened', data: 'one' },
                { type: 'ThatHappened', data: 'two' },
              ],
              expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', done)
        results.on('stored-events', (storedEvents) => {
          try {
            should(
              every(storedEvents, ({ correlationId }) =>
                isString(correlationId),
              ),
            ).be.True()
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('emits `error` if there is a version mismatch', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()

        let stream = sample(streams)
        let streamVersion = stream.version
        stream = pick(stream, ['id', 'type'])

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: stream,
              events: [
                { type: 'ThisHappened', data: 'one' },
                { type: 'ThatHappened', data: 'two' },
              ],
              expectedSequenceNumber: streamVersion - 1,
            },
          ],
          transactionId,
        })

        results.on('error', (err) => {
          try {
            should(err.message.indexOf('CONSISTENCY|')).equal(0)
            let jsonErrors = JSON.parse(err.message.split('|')[1])
            should(jsonErrors).containDeepOrdered([
              {
                message: 'STREAM_SEQUENCE_MISMATCH',
                stream: stream,
                actualSequenceNumber: streamVersion,
                expectedSequenceNumber: streamVersion - 1,
              },
            ])
            done()
          } catch (e) {
            done(e)
          }
        })
        results.on('stored-events', () => done(new Error('should emit error')))
      })
      it('emits `error` if expectedSequenceNumber === ANY_POSITIVE_VERSION_NUMBER ad the stream does not exist', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = random(100) > 50 ? uuid() : null

        let stream = {
          ...pick(sample(streams), ['type']),
          id: 'notExistent',
        }

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: stream,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: ANY_POSITIVE_SEQUENCE_NUMBER,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', (err) => {
          try {
            should(err.message.indexOf('CONSISTENCY|')).equal(0)
            let jsonErrors = JSON.parse(err.message.split('|')[1])
            should(jsonErrors).containDeepOrdered([
              {
                message: 'STREAM_DOES_NOT_EXIST',
                stream: stream,
              },
            ])
            done()
          } catch (e) {
            done(e)
          }
        })
        results.on('stored-events', () => done(new Error('should emit error')))
      })
      it('DOES NOT write any event if the writing to any stream fails', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = null

        let stream = sample(streams)
        let streamVersion = stream.version
        let newStream = {
          id: uuid(),
          type: {
            context: uuid(),
            name: uuid(),
          },
        }
        stream = pick(stream, ['id', 'type'])

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: stream,
              events: [
                { type: 'aType', data: '' },
                { type: 'aType', data: '' },
              ],
              expectedSequenceNumber: streamVersion - 1,
            },
            {
              stream: newStream,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: 0,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', () => {
          try {
            let totalEvents = JSON.parse(fs.readFileSync(JSON_FILE)).length
            should(totalEvents).equal(db.events.length)
            done()
          } catch (e) {
            done(e)
          }
        })
        results.on('stored-events', () =>
          done(new Error('should not emit stored events')),
        )
      })
      it('creates a new stream if writing to a not existent stream with expectedSequenceNumber === ANY_VERSION_NUMBER or 0', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = uuid()

        let newStream = {
          id: uuid(),
          type: {
            context: uuid(),
            name: uuid(),
          },
        }
        let newStream2 = {
          id: uuid(),
          type: {
            context: uuid(),
            name: uuid(),
          },
        }

        let totalInitialEvents = db.events.length

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: newStream,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
            },
            {
              stream: newStream2,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: 0,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', done)
        results.on('stored-events', (storedEvents) => {
          try {
            should(db.events.length).equal(totalInitialEvents + 2)
            should(
              db.events.filter(({ stream }) => stream.id === newStream.id)
                .length,
            ).equal(1)
            should(
              db.events.filter(({ stream }) => stream.id === newStream2.id)
                .length,
            ).equal(1)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
      it('saves events for multiple streams whithin the same transaction', (done) => {
        let db = getAdapter(JSON_FILE)
        let transactionId = uuid()
        let correlationId = uuid()

        let newStream = {
          id: uuid(),
          type: {
            context: uuid(),
            name: uuid(),
          },
        }
        let newStream2 = {
          id: uuid(),
          type: {
            context: uuid(),
            name: uuid(),
          },
        }

        let results = db.appendEvents({
          appendRequests: [
            {
              stream: newStream,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
            },
            {
              stream: newStream2,
              events: [{ type: 'aType', data: '' }],
              expectedSequenceNumber: 0,
            },
          ],
          transactionId,
          correlationId,
        })

        results.on('error', done)
        results.on('stored-events', (storedEvents) => {
          try {
            let transactions = uniq(
              storedEvents.map(({ transactionId }) => transactionId),
            )
            should(transactions.length).equal(1)
            should(transactions[0]).equal(transactionId)
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    })
  })
})
