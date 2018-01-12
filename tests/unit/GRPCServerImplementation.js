/* global describe it */
import path from 'path'
import uuid from 'uuid'
import BigNumber from 'bignumber.js'
import should from 'should/as-function'
import { every, isFunction, sample, pick, random, range, last } from 'lodash'

import Mocks from '../Mocks'

const codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
const { default: Implementation } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'Implementation',
))
const { padId } = require(path.resolve(codeFolder, 'InMemoryAdapter'))
const {
  ANY_SEQUENCE_NUMBER,
  ANY_POSITIVE_SEQUENCE_NUMBER,
} = require(path.resolve(codeFolder))

const methods = [
  'appendEventsToMultipleStreams',
  'appendEventsToStream',
  'catchUpWithStore',
  'catchUpWithStream',
  'catchUpWithStreamType',
  'ping',
  'readStoreForward',
  'readStreamForward',
  'readStreamTypeForward',
  'subscribeToStore',
  'subscribeToStream',
  'subscribeToStreamType',
]

describe('lib/GRPCServer/Implementation({db, isStreamWritable, eventsStream, onEventsStored})', () => {
  it('is a function', () => {
    should(Implementation).be.a.Function()
  })
  it(`implementation = Implementation(config) is a map of methods: \n\t${methods.join(
    '()\n\t',
  )}()`, () => {
    let implementation = Implementation({})
    let keys = Object.keys(implementation).sort()
    should(keys).eql(methods.slice().sort())
    should(every(keys, (key) => isFunction(implementation[key]))).be.True()
  })

  describe('implementation.appendEventsToMultipleStreams(call, callback)', () => {
    it('is a function', () => {
      should(Implementation({}).appendEventsToMultipleStreams).be.a.Function()
    })
    it('invokes callback(error) if call.request.appendRequests.length === 0', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequests: [],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if anyone of call.request.appendRequests is not a valid appendRequest or they do not concern a different stream each', () => {
      let mocks
      let impl

      // Missing stream
      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequests: [
          {
            stream: null,
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      // Missing stream type
      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              id: uuid(),
            },
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      // Same stream repeated
      mocks = Mocks()
      impl = Implementation(mocks.config)
      let stream = {
        type: {
          context: uuid(),
          name: uuid(),
        },
        id: uuid(),
      }
      mocks.call.request = {
        appendRequests: [
          {
            stream: stream,
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
          {
            stream: stream,
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      // No events
      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      // No event type
      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      // expectedSequenceNumber less than ANY_SEQUENCE_NUMBER
      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'aType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER - 1,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
    })
    it('invokes db.appendEvents() with right parameters', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_POSITIVE_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, mocks.callback)

      should(mocks.config.db.appendEvents.calledOnce).be.True()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].transactionId,
      ).be.a.String()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests,
      ).be.an.Array()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests.length,
      ).equal(2)

      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0].stream,
      ).eql(mocks.call.request.appendRequests[0].stream)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0].events,
      ).containDeepOrdered(mocks.call.request.appendRequests[0].events)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0]
          .expectedSequenceNumber,
      ).equal(ANY_SEQUENCE_NUMBER)

      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[1].stream,
      ).eql(mocks.call.request.appendRequests[1].stream)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[1].events,
      ).containDeepOrdered(mocks.call.request.appendRequests[1].events)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[1]
          .expectedSequenceNumber,
      ).equal(ANY_POSITIVE_SEQUENCE_NUMBER)
    })
    it('invokes callback(error) if there is a consistency error in appending the events. Error message is `CONSISTENCY|` plus a json string describing the error for each stream.', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let existingStream = sample(mocks.config.db.streams)

      mocks.call.request = {
        appendRequests: [
          // Append to not existing stream expecting ANY_POSITIVE_SEQUENCE_NUMBER
          {
            stream: {
              id: uuid(),
              type: {
                context: uuid(),
                name: uuid(),
              },
            },
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: ANY_POSITIVE_SEQUENCE_NUMBER,
          },
          // Append to existing stream expecting wrong version
          {
            stream: pick(existingStream, ['id', 'type']),
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: existingStream.version - 1,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, (err, results) => {
        should(err).be.an.instanceOf(Error)
        should(err.message.indexOf('CONSISTENCY|')).equal(0)
        should(results).be.undefined()

        let errors = JSON.parse(err.message.replace('CONSISTENCY|', ''))
        should(errors.length).equal(2)

        should(errors[0].message).equal('STREAM_DOES_NOT_EXIST')
        should(errors[0].stream).eql(
          mocks.call.request.appendRequests[0].stream,
        )

        should(errors[1].message).equal('STREAM_SEQUENCE_MISMATCH')
        should(errors[1].stream).eql(
          mocks.call.request.appendRequests[1].stream,
        )
        should(errors[1].actualSequenceNumber).eql(existingStream.version)
        should(errors[1].expectedSequenceNumber).eql(existingStream.version - 1)

        done()
      })
    })
    it('invokes callback(error) if any of the streams is not writable by config. Error message is `NOT_WRITABLE_STREAM|` plus a json string representing the first encountered not writable stream', (done) => {
      let isStreamWritable = () => false
      let mocks = Mocks(isStreamWritable)
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: uuid() }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: uuid() }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, (err, results) => {
        should(err).be.an.instanceOf(Error)
        should(err.message.indexOf('NOT_WRITABLE_STREAM|')).equal(0)
        should(results).be.undefined()

        let notWritableStream = JSON.parse(
          err.message.replace('NOT_WRITABLE_STREAM|', ''),
        )
        should(notWritableStream).eql(
          mocks.call.request.appendRequests[0].stream,
        )

        done()
      })
    })
    it('invokes callback(null, {events}) if the events are successfully appended', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequests: [
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: uuid() }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
          {
            stream: {
              type: {
                context: uuid(),
                name: uuid(),
              },
              id: uuid(),
            },
            events: [{ type: 'evtType', data: uuid() }],
            expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
          },
        ],
      }

      impl.appendEventsToMultipleStreams(mocks.call, (err, results) => {
        should(err).be.Null()
        should(results).be.an.Object()
        should(results.events).be.an.Array()
        should(results.events).containDeepOrdered([
          {
            ...mocks.call.request.appendRequests[0].events[0],
            stream: mocks.call.request.appendRequests[0].stream,
          },
          {
            ...mocks.call.request.appendRequests[1].events[0],
            stream: mocks.call.request.appendRequests[1].stream,
          },
        ])
        done()
      })
    })
  })
  describe('implementation.appendEventsToStream(call, callback)', () => {
    it('is a function', () => {
      should(Implementation({}).appendEventsToStream).be.a.Function()
    })
    it('invokes callback(error) if call.request.appendRequest is missing', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequest: null,
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if call.request.appendRequest.stream is missing', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: null,
          events: [{ type: 'evtType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if call.request.appendRequest.stream.type is missing', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
          },
          events: [{ type: 'evtType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if call.request.appendRequest.stream.type.name is an empty string or a string made of only spaces', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: '',
            },
          },
          events: [{ type: 'evtType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()

      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: '   ',
            },
          },
          events: [{ type: 'evtType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if call.request.appendRequest.events.length === 0', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          events: [],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if anyone of call.request.appendRequest.events provides an empty type or a type made of only spaces', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          events: [{ type: '', data: '' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)

      mocks = Mocks()
      impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          events: [{ type: '     ', data: '' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if call.request.appendRequest.expectedSequenceNumber is lower then -2', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            type: {
              context: uuid(),
              name: uuid(),
            },
            id: uuid(),
          },
          events: [{ type: 'aType', data: 'data' }],
          expectedSequenceNumber: -3,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
    })
    it('invokes callback(error) if the stream is not writable by config. Error message is `NOT_WRITABLE_STREAM|` plus a json string representing the not writable stream', () => {
      let mocks = Mocks(() => false)
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            type: {
              context: uuid(),
              name: uuid(),
            },
            id: uuid(),
          },
          events: [{ type: 'aType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.callback.calledOnce).be.True()
      should(mocks.callback.firstCall.args[0]).be.an.instanceOf(Error)
      should(mocks.callback.firstCall.args[1]).be.undefined()
      should(
        mocks.callback.firstCall.args[0].message.indexOf(
          'NOT_WRITABLE_STREAM|',
        ),
      ).equal(0)

      let notWritableStream = JSON.parse(
        mocks.callback.firstCall.args[0].message.replace(
          'NOT_WRITABLE_STREAM|',
          '',
        ),
      )
      should(notWritableStream).eql(mocks.call.request.appendRequest.stream)
    })
    it('invokes db.appendEvents() with right parameters', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)
      mocks.call.request = {
        appendRequest: {
          stream: {
            type: {
              context: uuid(),
              name: uuid(),
            },
            id: uuid(),
          },
          events: [{ type: 'aType', data: 'data' }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, mocks.callback)

      should(mocks.config.db.appendEvents.calledOnce).be.True()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].transactionId,
      ).be.a.String()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests,
      ).be.an.Array()
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests.length,
      ).equal(1)

      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0].stream,
      ).eql(mocks.call.request.appendRequest.stream)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0].events,
      ).eql(mocks.call.request.appendRequest.events)
      should(
        mocks.config.db.appendEvents.firstCall.args[0].appendRequests[0]
          .expectedSequenceNumber,
      ).equal(ANY_SEQUENCE_NUMBER)
    })
    it('invokes callback(error) if there is a consistency error in appending the events. Error message is `CONSISTENCY|` plus a json string describing the error.', (done) => {
      let mocks
      let impl

      // Append to not existing stream expecting ANY_POSITIVE_SEQUENCE_NUMBER
      mocks = Mocks()
      impl = Implementation(mocks.config)

      let existingStream = sample(mocks.config.db.streams)

      mocks.call.request = {
        appendRequest: {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          events: [{ type: 'evtType', data: 'data' }],
          expectedSequenceNumber: ANY_POSITIVE_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, (err, results) => {
        should(err).be.an.instanceOf(Error)
        should(err.message.indexOf('CONSISTENCY|')).equal(0)
        should(results).be.undefined()

        let errors = JSON.parse(err.message.replace('CONSISTENCY|', ''))
        should(errors.length).equal(1)

        should(errors[0].message).equal('STREAM_DOES_NOT_EXIST')
        should(errors[0].stream).eql(mocks.call.request.appendRequest.stream)

        // Append to existing stream expecting wrong version
        mocks = Mocks()
        impl = Implementation(mocks.config)

        existingStream = sample(mocks.config.db.streams)

        mocks.call.request = {
          appendRequest: {
            stream: pick(existingStream, ['id', 'type']),
            events: [{ type: 'evtType', data: 'data' }],
            expectedSequenceNumber: existingStream.version - 1,
          },
        }

        impl.appendEventsToStream(mocks.call, (err, results) => {
          should(err).be.an.instanceOf(Error)
          should(err.message.indexOf('CONSISTENCY|')).equal(0)
          should(results).be.undefined()

          let errors = JSON.parse(err.message.replace('CONSISTENCY|', ''))
          should(errors.length).equal(1)

          should(errors[0].message).equal('STREAM_SEQUENCE_MISMATCH')
          should(errors[0].stream).eql(mocks.call.request.appendRequest.stream)
          should(errors[0].actualSequenceNumber).eql(existingStream.version)
          should(errors[0].expectedSequenceNumber).eql(
            existingStream.version - 1,
          )

          done()
        })
      })
    })
    it('invokes callback(null, {events}) if the events are successfully appended', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {
        appendRequest: {
          stream: {
            type: {
              context: uuid(),
              name: uuid(),
            },
            id: uuid(),
          },
          events: [{ type: 'evtType', data: uuid() }],
          expectedSequenceNumber: ANY_SEQUENCE_NUMBER,
        },
      }

      impl.appendEventsToStream(mocks.call, (err, results) => {
        should(err).be.Null()
        should(results).be.an.Object()
        should(results.events).be.an.Array()
        should(results.events).containDeepOrdered([
          {
            ...mocks.call.request.appendRequest.events[0],
            stream: mocks.call.request.appendRequest.stream,
          },
        ])
        done()
      })
    })
  })
  describe('implementation.catchUpWithStore(call)', () => {
    it('is a function', () => {
      should(Implementation({}).catchUpWithStore).be.a.Function()
    })
    it('invokes db.getEvents() with right parameters', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStore(mocks.call)

      let databaseEvents = mocks.config.db.events
      let startEventIndex = random(
        databaseEvents.length - 30,
        databaseEvents.length - 10,
      )
      let startEvent = databaseEvents[startEventIndex]
      let fromEventId = startEvent.id

      mocks.call.emit('data', { fromEventId: fromEventId })

      mocks.call.observer.on('write', () => {
        mocks.call.emit('end')
        try {
          should(mocks.config.db.getEvents.firstCall.args[0]).eql({
            fromEventId: new BigNumber(fromEventId).toString(),
          })
          done()
        } catch (e) {
          done(e)
        }
      })
    })
    it('invokes call.write(event) for every fetched and live event, in the right sequence', function (done) {
      this.timeout(5000)

      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStore(mocks.call)

      let databaseEvents = mocks.config.db.events
      let startEventIndex = random(databaseEvents.length - 10)
      let startEvent = databaseEvents[startEventIndex]
      let fromEventId = startEvent.id
      let eventsToFetch = databaseEvents.slice(startEventIndex + 1)
      let newEvents = range(1, 4).map((n) => ({
        id: padId(databaseEvents.length + n),
      }))
      let expectedEventIds = eventsToFetch
        .map(({ id }) => id)
        .concat(newEvents.map(({ id }) => id))

      mocks.call.emit('data', { fromEventId: fromEventId })

      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.id === last(eventsToFetch).id) {
            process.nextTick(() => {
              mocks.config.onEventsStored(newEvents)
            })
          }
          if (event.id === last(newEvents).id) {
            should(mocks.call.write.callCount).equal(expectedEventIds.length)
            let writtenEventIds = mocks.call.write
              .getCalls()
              .map(({ args: [event] }) => event.id)
            should(writtenEventIds).eql(expectedEventIds)
            done()
          }
        } catch (e) {
          done(e)
        }
      })
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', function (done) {
      this.timeout(5000)

      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStore(mocks.call)

      let databaseEvents = mocks.config.db.events
      let startEventIndex = random(databaseEvents.length - 10)
      let startEvent = databaseEvents[startEventIndex]
      let fromEventId = startEvent.id
      let eventsToFetch = databaseEvents.slice(startEventIndex + 1)
      eventsToFetch = eventsToFetch.slice(0, random(1, eventsToFetch.length))

      mocks.call.emit('data', { fromEventId: fromEventId })

      mocks.call.observer.on('end', () => {
        try {
          should(mocks.call.write.callCount).equal(eventsToFetch.length)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.id === last(eventsToFetch).id) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })
    })
  })
  describe('implementation.catchUpWithStream(call)', () => {
    it('is a function', () => {
      should(Implementation({}).catchUpWithStream).be.a.Function()
    })
    it('emits `error` on call if stream is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', { fromSequenceNumber: 0 })
    })
    it('emits `error` on call if stream is missing type', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        stream: {
          id: uuid(),
        },
        fromSequenceNumber: 0,
      })
    })
    it('emits `error` on call if stream.type is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        stream: {
          id: uuid(),
          type: {
            context: uuid(),
            name: '  ',
          },
        },
        strefromSequenceNumber: 0,
      })
    })
    it('invokes db.getEventsByStream() with right parameters', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      let stream = sample(mocks.config.db.streams)
      let fromSequenceNumber = random(0, stream.version)
      stream = pick(stream, ['id', 'type'])

      mocks.call.observer.on('write', () => {
        mocks.call.emit('end')
        try {
          should(mocks.config.db.getEventsByStream.firstCall.args[0]).eql({
            stream: stream,
            fromSequenceNumber: fromSequenceNumber,
          })
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        stream: stream,
        fromSequenceNumber: fromSequenceNumber,
      })
    })
    it('invokes call.write(event) for every fetched and live event, in the right sequence', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      let databaseEvents = mocks.config.db.events
      let stream = sample(mocks.config.db.streams)
      let eventsToFetch = stream.events
      stream = pick(stream, ['id', 'type'])
      let newEvents = range(1, 4).map((n) => ({
        id: padId(databaseEvents.length + n),
        stream: stream,
        sequenceNumber: eventsToFetch.length + n,
      }))
      let expectedEventIds = eventsToFetch
        .map(({ id }) => id)
        .concat(newEvents.map(({ id }) => id))

      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.id === last(eventsToFetch).id) {
            process.nextTick(() => {
              mocks.config.onEventsStored(newEvents)
            })
          }
          if (event.id === last(newEvents).id) {
            should(mocks.call.write.callCount).equal(expectedEventIds.length)
            let writtenEventIds = mocks.call.write
              .getCalls()
              .map(({ args: [event] }) => event.id)
            should(writtenEventIds).eql(expectedEventIds)
            done()
          }
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        stream: stream,
        fromSequenceNumber: 0,
      })
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStream(mocks.call)

      let stream = sample(mocks.config.db.streams)
      let randomVersion = random(1, stream.version - 1)
      stream = pick(stream, ['id', 'type'])

      mocks.call.observer.on('end', () => {
        try {
          should(mocks.call.write.callCount).equal(randomVersion)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.sequenceNumber === randomVersion) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        stream: stream,
        fromSequenceNumber: 0,
      })
    })
  })
  describe('implementation.catchUpWithStreamType(call)', () => {
    it('is a function', () => {
      should(Implementation({}).catchUpWithStreamType).be.a.Function()
    })
    it('emits `error` on call if streamType is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStreamType(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', { fromEventId: '0' })
    })
    it('emits `error` on call if streamType is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStreamType(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        streamType: {
          context: uuid(),
          name: '',
        },
        fromEventId: '0',
      })
    })
    it('invokes db.getEventsByStreamType() with right parameters', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStreamType(mocks.call)

      let streamType = sample(mocks.config.db.streamTypes)
      let fromEventIndex = random(0, streamType.events.length - 2)
      let fromEvent = streamType.events[fromEventIndex]
      let fromEventId = fromEvent.id
      streamType = pick(streamType, ['context', 'name'])

      mocks.call.observer.on('write', () => {
        mocks.call.emit('end')
        try {
          should(mocks.config.db.getEventsByStreamType.firstCall.args[0]).eql({
            streamType: streamType,
            fromEventId: new BigNumber(fromEventId).toString(),
          })
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        streamType: streamType,
        fromEventId: fromEventId,
      })
    })
    it('invokes call.write(event) for every fetched and live event, in the right sequence', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStreamType(mocks.call)

      let databaseEvents = mocks.config.db.events
      let streamType = sample(mocks.config.db.streamTypes)
      let fromEventIndex = random(0, streamType.events.length - 2)
      let fromEvent = streamType.events[fromEventIndex]
      let fromEventId = fromEvent.id
      let eventsToFetch = streamType.events.slice(fromEventIndex + 1)
      streamType = pick(streamType, ['context', 'name'])
      let newEvents = range(1, 4).map((n) => ({
        id: padId(databaseEvents.length + n),
        stream: {
          id: uuid(),
          type: streamType,
        },
      }))
      let expectedEventIds = eventsToFetch
        .map(({ id }) => id)
        .concat(newEvents.map(({ id }) => id))

      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.id === last(eventsToFetch).id) {
            process.nextTick(() => {
              mocks.config.onEventsStored(newEvents)
            })
          }
          if (event.id === last(newEvents).id) {
            should(mocks.call.write.callCount).equal(expectedEventIds.length)
            let writtenEventIds = mocks.call.write
              .getCalls()
              .map(({ args: [event] }) => event.id)
            should(writtenEventIds).eql(expectedEventIds)
            done()
          }
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        streamType: streamType,
        fromEventId: fromEventId,
      })
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.catchUpWithStreamType(mocks.call)

      let streamType = sample(mocks.config.db.streamTypes)
      let totalToWrite = random(1, streamType.events.length - 1)
      let eventsToFetch = streamType.events.slice(0, totalToWrite)
      streamType = pick(streamType, ['context', 'name'])

      mocks.call.observer.on('end', () => {
        try {
          should(mocks.call.write.callCount).equal(totalToWrite)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          if (event.id === last(eventsToFetch).id) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })

      mocks.call.emit('data', {
        streamType: streamType,
        fromEventId: '0',
      })
    })
  })
  describe('implementation.ping(call, callback)', () => {
    it('is a function', () => {
      should(Implementation({}).ping).be.a.Function()
    })
    it('invokes callback(null, {})', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.request = {}

      impl.ping(mocks.call, (err, result) => {
        should(err).be.Null()
        should(result).be.an.Object()
        should(result).eql({})
        done()
      })
    })
  })
  describe('implementation.readStoreForward(call)', () => {
    it('is a function', () => {
      should(Implementation({}).readStoreForward).be.a.Function()
    })
    it('invokes db.getEvents() with right parameters', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let fromEvent = sample(mocks.config.db.events)
      let limit = random(1, 10)

      mocks.call.request = {
        fromEventId: fromEvent.id,
        limit: limit,
      }

      impl.readStoreForward(mocks.call)

      should(mocks.config.db.getEvents.firstCall.args[0]).eql({
        fromEventId: new BigNumber(fromEvent.id).toString(),
        limit: limit,
      })
    })
    it('invokes call.write(event) for every fetched event and then invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let databaseEvents = mocks.config.db.events
      let fromEventIndex = random(0, databaseEvents.length - 1)
      let fromEvent = databaseEvents[fromEventIndex]
      let limit = random(0, 4)
      let eventsToFetch = databaseEvents.slice(fromEventIndex + 1)
      if (limit) {
        eventsToFetch = eventsToFetch.slice(0, limit)
      }
      let expectedEventIds = eventsToFetch.map(({ id }) => id)

      mocks.call.request = {
        fromEventId: fromEvent.id,
        limit: limit,
      }

      let writtenEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(writtenEventIds).eql(expectedEventIds)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          writtenEventIds.push(event.id)
        } catch (e) {
          done(e)
        }
      })

      impl.readStoreForward(mocks.call)
    })
  })
  describe('implementation.readStreamForward(call)', () => {
    it('is a function', () => {
      should(Implementation({}).readStreamForward).be.a.Function()
    })
    it('emits `error` on call if call.request.stream is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledOnce).be.True()
          should(mocks.call.emit.firstCall.args[0]).equal('error')
          should(mocks.call.emit.firstCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.request = {}
      impl.readStreamForward(mocks.call)
    })
    it('emits `error` on call if stream is missing type', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledOnce).be.True()
          should(mocks.call.emit.firstCall.args[0]).equal('error')
          should(mocks.call.emit.firstCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.request = {
        id: uuid(),
      }
      impl.readStreamForward(mocks.call)
    })
    it('emits `error` on call if stream.type is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledOnce).be.True()
          should(mocks.call.emit.firstCall.args[0]).equal('error')
          should(mocks.call.emit.firstCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.request = {
        id: uuid(),
        type: {
          context: uuid(),
          name: '   ',
        },
      }
      impl.readStreamForward(mocks.call)
    })
    it('invokes db.getEventsByStream() with right parameters', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let stream = sample(mocks.config.db.streams)
      let fromSequenceNumber = random(1, stream.version)
      stream = pick(stream, ['id', 'type'])
      let limit = random(0, 5)

      mocks.call.request = {
        stream: stream,
        fromSequenceNumber: fromSequenceNumber,
        limit: limit,
      }

      impl.readStreamForward(mocks.call)

      should(mocks.config.db.getEventsByStream.firstCall.args[0]).eql({
        stream: stream,
        fromSequenceNumber: fromSequenceNumber,
        limit: limit || null,
      })
    })
    it('invokes call.write(event) for every fetched event and then invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let stream = sample(mocks.config.db.streams)
      let fromSequenceNumber = random(1, stream.version - 1)
      let expectedEventIds = stream.events
        .slice(fromSequenceNumber)
        .map(({ id }) => id)
      let limit = random(0, expectedEventIds.length)
      if (limit) {
        expectedEventIds = expectedEventIds.slice(0, limit)
      }
      stream = pick(stream, ['id', 'type'])

      mocks.call.request = {
        stream: stream,
        fromSequenceNumber: fromSequenceNumber,
        limit: limit,
      }

      let writtenEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(writtenEventIds).eql(expectedEventIds)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          writtenEventIds.push(event.id)
        } catch (e) {
          done(e)
        }
      })

      impl.readStreamForward(mocks.call)
    })
  })
  describe('implementation.readStreamTypeForward(call)', () => {
    it('is a function', () => {
      should(Implementation({}).readStreamTypeForward).be.a.Function()
    })
    it('emits `error` on call if streamType is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledOnce).be.True()
          should(mocks.call.emit.firstCall.args[0]).equal('error')
          should(mocks.call.emit.firstCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.request = {
        fromEventId: '0',
      }
      impl.readStreamTypeForward(mocks.call)
    })
    it('emits `error` on call if streamType is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledOnce).be.True()
          should(mocks.call.emit.firstCall.args[0]).equal('error')
          should(mocks.call.emit.firstCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })

      mocks.call.request = {
        streamType: {
          context: uuid(),
          name: '  ',
        },
        fromEventId: '0',
      }
      impl.readStreamTypeForward(mocks.call)
    })
    it('invokes db.getEventsByStreamType() with right parameters', () => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let streamType = sample(mocks.config.db.streamTypes)
      let fromEvent = sample(streamType.events)
      let fromEventId = fromEvent.id
      streamType = pick(streamType, ['context', 'name'])
      let limit = random(0, 5)

      mocks.call.request = {
        streamType: streamType,
        fromEventId: fromEventId,
        limit: limit,
      }

      impl.readStreamTypeForward(mocks.call)

      should(mocks.config.db.getEventsByStreamType.firstCall.args[0]).eql({
        streamType: streamType,
        fromEventId: new BigNumber(fromEventId).toString(),
        limit: limit || null,
      })
    })
    it('invokes call.write(event) for every fetched event and then invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let streamType = sample(mocks.config.db.streamTypes)
      let fromEventIndex = random(0, streamType.events.length - 5)
      let fromEvent = streamType.events[fromEventIndex]
      let eventsToFetch = streamType.events.slice(fromEventIndex + 1)
      let limit = random(0, 5)
      if (limit) {
        eventsToFetch = eventsToFetch.slice(0, limit)
      }
      streamType = pick(streamType, ['context', 'name'])
      let expectedEventIds = eventsToFetch.map(({ id }) => id)

      mocks.call.request = {
        streamType: streamType,
        fromEventId: fromEvent.id,
        limit: limit,
      }

      let writtenEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(writtenEventIds).eql(expectedEventIds)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          writtenEventIds.push(event.id)
        } catch (e) {
          done(e)
        }
      })

      impl.readStreamTypeForward(mocks.call)
    })
  })
  describe('implementation.subscribeToStore(call)', () => {
    it('is a function', () => {
      should(Implementation({}).subscribeToStore).be.a.Function()
    })
    it('invokes call.write(event) for every live event', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let newEvents = range(1, 4).map((n) => ({
        id: padId(n),
      }))

      let receivedEventIds = []
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEvents).id) {
            should(receivedEventIds).eql(newEvents.map(({ id }) => id))
            done()
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStore(mocks.call)
      mocks.call.emit('data', {})
      setTimeout(() => mocks.config.onEventsStored(newEvents), 10)
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let newEventsFirstSlot = range(1, 4).map((n) => ({
        id: padId(n),
      }))
      let newEventsSecondSlot = range(4, 7).map((n) => ({
        id: padId(n),
      }))

      let receivedEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(receivedEventIds).eql(newEventsFirstSlot.map(({ id }) => id))
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEventsFirstSlot).id) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStore(mocks.call)
      mocks.call.emit('data', {})
      setTimeout(() => {
        mocks.config.onEventsStored(newEventsFirstSlot)
        mocks.config.onEventsStored(newEventsSecondSlot)
      }, 10)
    })
  })
  describe('implementation.subscribeToStream(call)', () => {
    it('is a function', () => {
      should(Implementation({}).subscribeToStream).be.a.Function()
    })
    it('emits `error` on call if stream is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.subscribeToStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', { fromSequenceNumber: 0 })
    })
    it('emits `error` on call if stream is missing type', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.subscribeToStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        stream: {
          id: uuid(),
        },
        strefromSequenceNumber: 0,
      })
    })
    it('emits `error` on call if stream.type is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.subscribeToStream(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        stream: {
          id: uuid(),
          type: {
            context: uuid(),
            name: '  ',
          },
        },
        strefromSequenceNumber: 0,
      })
    })
    it('invokes call.write(event) for every live event', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let totalEventsInDdatabase = mocks.config.db.events.length
      let stream = pick(sample(mocks.config.db.streams), ['id', 'type'])

      let newEvents = range(1, 4).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: stream,
      }))

      let receivedEventIds = []
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEvents).id) {
            should(receivedEventIds).eql(newEvents.map(({ id }) => id))
            done()
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStream(mocks.call)
      mocks.call.emit('data', {
        stream: stream,
      })
      setTimeout(() => mocks.config.onEventsStored(newEvents), 10)
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let totalEventsInDdatabase = mocks.config.db.events.length
      let stream = pick(sample(mocks.config.db.streams), ['id', 'type'])

      let newEventsFirstSlot = range(1, 4).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: stream,
      }))
      let newEventsSecondSlot = range(4, 7).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: stream,
      }))

      let receivedEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(receivedEventIds).eql(newEventsFirstSlot.map(({ id }) => id))
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEventsFirstSlot).id) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStream(mocks.call)
      mocks.call.emit('data', {
        stream: stream,
      })
      setTimeout(() => {
        mocks.config.onEventsStored(newEventsFirstSlot)
        mocks.config.onEventsStored(newEventsSecondSlot)
      }, 10)
    })
  })
  describe('implementation.subscribeToStreamType(call)', () => {
    it('is a function', () => {
      should(Implementation({}).subscribeToStreamType).be.a.Function()
    })
    it('emits `error` on call if streamType is not provided', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.subscribeToStreamType(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', { fromEventId: '0' })
    })
    it('emits `error` on call if streamType is not valid', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      impl.subscribeToStreamType(mocks.call)

      mocks.call.on('error', () => {
        try {
          should(mocks.call.emit.calledTwice).be.True()
          should(mocks.call.emit.secondCall.args[0]).equal('error')
          should(mocks.call.emit.secondCall.args[1]).be.an.instanceOf(Error)
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.emit('data', {
        streamType: {
          context: uuid(),
          name: '  ',
        },
        fromEventId: '0',
      })
    })
    it('invokes call.write(event) for every live event', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let totalEventsInDdatabase = mocks.config.db.events.length
      let streamType = pick(sample(mocks.config.db.streamTypes), [
        'context',
        'name',
      ])

      let newEvents = range(1, 4).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: {
          id: uuid(),
          type: streamType,
        },
      }))

      let receivedEventIds = []
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEvents).id) {
            should(receivedEventIds).eql(newEvents.map(({ id }) => id))
            done()
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStreamType(mocks.call)
      mocks.call.emit('data', {
        streamType: streamType,
      })
      setTimeout(() => mocks.config.onEventsStored(newEvents), 10)
    })
    it('stops invoking call.write(event) if client signals `end` and invokes call.end()', (done) => {
      let mocks = Mocks()
      let impl = Implementation(mocks.config)

      let totalEventsInDdatabase = mocks.config.db.events.length
      let streamType = pick(sample(mocks.config.db.streamTypes), [
        'context',
        'name',
      ])

      let newEventsFirstSlot = range(1, 4).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: {
          id: uuid(),
          type: streamType,
        },
      }))
      let newEventsSecondSlot = range(4, 7).map((n) => ({
        id: padId(totalEventsInDdatabase + n),
        stream: {
          id: uuid(),
          type: streamType,
        },
      }))

      let receivedEventIds = []
      mocks.call.observer.on('end', () => {
        try {
          should(receivedEventIds).eql(newEventsFirstSlot.map(({ id }) => id))
          done()
        } catch (e) {
          done(e)
        }
      })
      mocks.call.observer.on('write', (...args) => {
        try {
          should(args.length).equal(1)
          let event = args[0]
          receivedEventIds.push(event.id)
          if (event.id === last(newEventsFirstSlot).id) {
            mocks.call.emit('end')
          }
        } catch (e) {
          done(e)
        }
      })
      impl.subscribeToStreamType(mocks.call)
      mocks.call.emit('data', {
        streamType: streamType,
      })
      setTimeout(() => {
        mocks.config.onEventsStored(newEventsFirstSlot)
        mocks.config.onEventsStored(newEventsSecondSlot)
      }, 10)
    })
  })
})
