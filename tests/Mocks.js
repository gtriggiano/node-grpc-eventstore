import path from 'path'
import sinon from 'sinon'
import EventEmitter from 'eventemitter3'
import Rx from 'rxjs/Rx'

import { pick, map } from 'lodash'

const codeFolder = path.resolve(__dirname, '..', process.env.CODE_FOLDER)
const { default: InMemoryAdapter } = require(path.resolve(
  codeFolder,
  'InMemoryAdapter',
))
const { default: SimpleStoreBus } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
  'helpers',
  'SimpleStoreBus',
))
const { default: eventsStreamFromStoreBus } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
  'helpers',
  'eventsStreamFromStoreBus',
))
const JSONEventsFile = path.resolve(__dirname, 'InMemoryAdapter', 'events.json')

function delayedResultsEmitter (results) {
  let delayedResults = new EventEmitter()

  Rx.Observable.zip(
    Rx.Observable.fromEvent(results, 'event').takeUntil(
      Rx.Observable.fromEvent(results, 'end'),
    ),
    Rx.Observable.interval(5),
  ).subscribe(
    ([event]) => delayedResults.emit('event', event),
    (error) => delayedResults.emit('error', error),
    () => delayedResults.emit('end'),
  )

  return delayedResults
}

function DbAdapter () {
  let adapter = InMemoryAdapter({ JSONFile: JSONEventsFile })

  let db = {
    getEvents: sinon.spy((args) =>
      delayedResultsEmitter(adapter.getEvents(args)),
    ),
    getEventsByStream: sinon.spy((args) =>
      delayedResultsEmitter(adapter.getEventsByStream(args)),
    ),
    getEventsByStreamType: sinon.spy((args) =>
      delayedResultsEmitter(adapter.getEventsByStreamType(args)),
    ),
    appendEvents: sinon.spy((args) => adapter.appendEvents(args)),
  }
  return Object.defineProperties(db, {
    events: { get: () => adapter.events },
    streams: {
      get: () => {
        let appearingStreams = adapter.events.map((event) => ({
          ...event.stream,
          event: event,
          serial: `${event.stream.type.context}:${event.stream.type.name}:${
            event.stream.id
          }`,
        }))
        let streamsBySerial = appearingStreams.reduce(
          (streamsBySerial, stream) => {
            streamsBySerial[stream.serial] = streamsBySerial[stream.serial] || {
              ...pick(stream, ['id', 'type']),
              events: [],
              version: 0,
            }
            streamsBySerial[stream.serial].events.push(stream.event)
            streamsBySerial[stream.serial].version++
            return streamsBySerial
          },
          {},
        )
        return map(streamsBySerial)
      },
    },
    streamTypes: {
      get: () => {
        let appearingStreamTypes = adapter.events.map((event) => ({
          ...event.stream.type,
          event: event,
          serial: `${event.stream.type.context}:${event.stream.type.name}`,
        }))
        let streamTypesBySerial = appearingStreamTypes.reduce(
          (streamTypesBySerial, streamType) => {
            streamTypesBySerial[streamType.serial] = streamTypesBySerial[
              streamType.serial
            ] || {
                ...pick(streamType, ['context', 'name']),
                events: [],
              }
            streamTypesBySerial[streamType.serial].events.push(streamType.event)
            return streamTypesBySerial
          },
          {},
        )
        return map(streamTypesBySerial)
      },
    },
  })
}
function RPCCall () {
  let call = new EventEmitter()
  call.observer = new EventEmitter()
  sinon.spy(call, 'on')
  sinon.spy(call, 'emit')
  sinon.spy(call, 'removeAllListeners')
  call.write = sinon.spy((...args) => call.observer.emit('write', ...args))
  call.end = sinon.spy(() => call.observer.emit('end'))
  return call
}
function RPCCallback () {
  return sinon.spy()
}

export default function Mocks (isStreamWritable = () => true) {
  let db = DbAdapter()
  let storeBus = SimpleStoreBus()
  let eventsStream = eventsStreamFromStoreBus(storeBus)
  let onEventsStored = sinon.spy((events) => {
    let eventsString = JSON.stringify(events)
    storeBus.publish(eventsString)
  })

  return {
    config: {
      db,
      eventsStream,
      onEventsStored,
      isStreamWritable: sinon.spy((stream) => isStreamWritable(stream)),
    },
    call: RPCCall(),
    callback: RPCCallback(),
  }
}
