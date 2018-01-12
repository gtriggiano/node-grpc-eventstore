/* global describe it */
import path from 'path'
import should from 'should/as-function'
import grpc from 'grpc'
import EventEmitter from 'eventemitter3'

let codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
let { default: EventStoreNode } = require(path.resolve(
  codeFolder,
  'EventStoreNode',
))
let { default: InMemoryAdapter } = require(path.resolve(
  codeFolder,
  'InMemoryAdapter',
))

function getValidConfig () {
  return {
    dbAdapter: InMemoryAdapter(),
    credentials: grpc.ServerCredentials.createInsecure(),
  }
}

describe('lib/EventStoreNode(config)', () => {
  it('is a function', () => should(EventStoreNode).be.a.Function())
  it('throws if config.port is defined and is not valid', () => {
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        port: 'bad',
      })
    }).throw(`config.port must be valid port number`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        port: 100000,
      })
    }).throw(`config.port must be valid port number`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        port: 5000,
      })
    }).not.throw()
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
      })
    }).not.throw()
  })
  it('throws if config.credentials is not valid', () => {
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        credentials: 'bad',
      })
    }).throw(`config.credentials must be valid GRPC credentials`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        credentials: null,
      })
    }).throw(`config.credentials must be valid GRPC credentials`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        credentials: {},
      })
    }).throw(`config.credentials must be valid GRPC credentials`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        credentials: grpc.ServerCredentials.createInsecure(),
      })
    }).not.throw()
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
      })
    }).not.throw()
  })
  it('throws if config.dbAdapter has not a valid interface', () => {
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        dbAdapter: null,
      })
    }).throw(`config.dbAdapter must have a valid interface`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        dbAdapter: {},
      })
    }).throw(`config.dbAdapter must have a valid interface`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        dbAdapter: {
          appendEvents: () => {},
          getEvents: () => {},
          getEventsByStream: () => {},
          getEventsByStreamType: () => {},
        },
      })
    }).not.throw()
  })
  it('throws if config.isStreamWritable is defined and is not a function', () => {
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        isStreamWritable: 'bad',
      })
    }).throw(`config.isStreamWritable must be a function`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        isStreamWritable: () => {},
      })
    }).not.throw()
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
      })
    }).not.throw()
  })
  it('throws if config.storeBus is defined and has not a valid interface', () => {
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        storeBus: null,
      })
    }).throw(`config.storeBus must have a valid interface`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
        storeBus: {},
      })
    }).throw(`config.storeBus must have a valid interface`)
    should(() => {
      EventStoreNode({
        ...getValidConfig(),
      })
    }).not.throw()
  })

  describe('eventStoreNode = EventStoreNode()', () => {
    it('is an event EventEmitter', () => {
      let node = EventStoreNode(getValidConfig())
      should(node).be.an.instanceOf(EventEmitter)
    })
    it('node.start() is a function', () => {
      let node = EventStoreNode(getValidConfig())
      should(node.start).be.a.Function()
    })
    it('node.stop() is a function', () => {
      let node = EventStoreNode(getValidConfig())
      should(node.stop).be.a.Function()
    })
    it('emits `start` and `stop` events', (done) => {
      let node = EventStoreNode(getValidConfig())
      node.once('start', () => node.stop())
      node.once('stop', () => done())
      node.start()
    })
  })
})
