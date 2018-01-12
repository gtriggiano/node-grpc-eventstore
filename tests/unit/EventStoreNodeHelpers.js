/* global describe it */
import path from 'path'
import should from 'should/as-function'
import EventEmitter from 'eventemitter3'
import Rx from 'rxjs/Rx'
import { range, random, mapValues } from 'lodash'

const codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
const { default: SimpleStoreBus } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
  'helpers',
  'SimpleStoreBus',
))
const { default: zeropad } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
  'helpers',
  'zeropad',
))
const { default: eventsStreamFromStoreBus } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
  'helpers',
  'eventsStreamFromStoreBus',
))

describe('lib/EventStoreNode/helpers/SimpleStoreBus()', () => {
  it('is a function', () => should(SimpleStoreBus).be.a.Function())

  describe('bus = SimpleStoreBus()', () => {
    it('bus is an EventEmitter', () => {
      let bus = SimpleStoreBus()
      should(bus).be.an.instanceOf(EventEmitter)
    })
    it('bus.safeOrderTimeframe === undefined', () => {
      let bus = SimpleStoreBus()
      should(bus.safeOrderTimeframe).be.Undefined()
    })
    it('bus.publish() is a function', () => {
      let bus = SimpleStoreBus()
      should(bus.publish).be.a.Function()
    })
    it('bus emits `events` whenever bus.publish(something) is invoked, passing `something` as payload', (done) => {
      let bus = SimpleStoreBus()
      let something = JSON.stringify([1, 2, 3])

      bus.once('events', (payload) => {
        try {
          should(payload).equal(something)
          done()
        } catch (e) {
          done(e)
        }
      })
      bus.publish(something)
    })
  })
})

describe('lib/EventStoreNode/helpers/zeropad(input, expectedLength)', () => {
  it('is a function', () => {
    should(zeropad).be.a.Function()
  })
  it('given a string or a number left pads it with zeroes until `expectedLength` is reached', () => {
    let n = 1234
    let nPadded = zeropad(n, 10)
    should(nPadded).equal('0000001234')
    let str = 'hello'
    let strPadded = zeropad(str, 10)
    should(strPadded).equal('00000hello')
    let alreadyOver = 1234567890
    let alreadyOverPadded = zeropad(alreadyOver, 5)
    should(alreadyOverPadded).equal('1234567890')
  })
})

describe('lib/EventStoreNode/helpers/eventsStreamFromStoreBus', () => {
  let toStringId = (n) => zeropad(n, 10)

  it('is a function', () => {
    should(eventsStreamFromStoreBus).be.a.Function()
  })
  describe('eventsStream = eventsStreamFromStoreBus(storeBus)', () => {
    it('is an instance of Rx.Observable', () => {
      let eventsStream = eventsStreamFromStoreBus(SimpleStoreBus())
      should(eventsStream).be.an.instanceof(Rx.Observable)
    })
    it('by default synchronously streams the events emitted through storeBus.emit(`events`, "[...]")', (done) => {
      let storeBus = SimpleStoreBus()
      let eventsStream = eventsStreamFromStoreBus(storeBus)

      let events = range(random(5, 20)).map((n) => ({ id: toStringId(n + 1) }))

      let count = 1
      let subscription = eventsStream.subscribe((event) => {
        should(event.id).equal(toStringId(count))
        if (count === events.length) {
          subscription.unsubscribe()
          done()
        } else {
          count++
        }
      })

      storeBus.emit('events', JSON.stringify(events))
    })
    it('if storeBus.safeOrderTimeframe is defined, delays eventsStream by storeBus.safeOrderTimeframe ms in respect to the stream of events emitted by `storeBus`', (done) => {
      let storeBus = SimpleStoreBus()
      storeBus.safeOrderTimeframe = 100
      let eventsStream = eventsStreamFromStoreBus(storeBus)

      let events = JSON.stringify(
        range(3).map((n) => ({ id: toStringId(n + 1) })),
      )
      let inputTime = process.hrtime()

      let subscription = eventsStream.subscribe(() => {
        try {
          let outputTime = process.hrtime(inputTime)
          let msDiff = outputTime[0] * 1e3 + outputTime[1] / 1e6
          should(msDiff > storeBus.safeOrderTimeframe).be.True()
          should(msDiff < storeBus.safeOrderTimeframe + 10).be.True()
          subscription.unsubscribe()
          done()
        } catch (e) {
          done(e)
        }
      })

      storeBus.emit('events', events)
    })
    it('if storeBus.safeOrderTimeframe is defined, ensures the right order of events emitted by `storeBus` within safeOrderTimeframe ms, ordering by event.id', (done) => {
      let eventsListsByEmissionTime = mapValues(
        {
          0: [1],
          80: [2, 3],
          200: [6, 7],
          210: [8, 9],
          250: [4, 5],
          270: [10],
        },
        (ids) => ids.map((id) => ({ id: toStringId(id) })),
      )

      let storeBus = SimpleStoreBus()
      storeBus.safeOrderTimeframe = 100
      let eventsStream = eventsStreamFromStoreBus(storeBus)

      let received = []
      let subscription = eventsStream.map(({ id }) => id).subscribe((id) => {
        received.push(id)
        if (received.length === 10) {
          try {
            subscription.unsubscribe()
            should(received).containDeepOrdered(
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toStringId),
            )
            done()
          } catch (e) {
            done(e)
          }
        }
      })

      Object.keys(eventsListsByEmissionTime).forEach((emissionTime) => {
        setTimeout(() => {
          storeBus.emit(
            'events',
            JSON.stringify(eventsListsByEmissionTime[emissionTime]),
          )
        }, parseInt(emissionTime, 10))
      })
    })
  })
})
