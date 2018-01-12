import EventEmitter from 'eventemitter3'

import GRPCServer from '../GRPCServer'

import eventsStreamFromStoreBus from './helpers/eventsStreamFromStoreBus'
import SimpleStoreBus from './helpers/SimpleStoreBus'
import validateNodeConfig from './helpers/validateNodeConfig'

export let defaultConfig = {
  port: 50051,
  isStreamWritable: () => true,
}

export { SimpleStoreBus }

/**
 * @constructor
 * @param       {Object} config
 * @param       {Object} config.port
 * @param       {Object} config.credentials
 * @param       {Object} config.dbAdapter
 * @param       {Object} config.isStreamWritable
 * @param       {Object} config.storeBus
 */
export default function EventStoreNode (config = {}) {
  config = { ...defaultConfig, storeBus: SimpleStoreBus(), ...config }
  validateNodeConfig(config)

  let _grpcServer
  let _started = false
  let _starting = false
  let _stopping = false

  let serverConfig = {
    port: config.port,
    credentials: config.credentials,
    db: config.dbAdapter,
    isStreamWritable: config.isStreamWritable,
    eventsStream: eventsStreamFromStoreBus(config.storeBus),
    onEventsStored: (events) => config.storeBus.publish(JSON.stringify(events)),
  }

  let node = new EventEmitter()
  return Object.defineProperties(node, {
    start: {
      value: () => {
        if (_started || _starting) return node
        if (_stopping) {
          node.once('stop', () => node.start())
          return node
        }

        _starting = true
        _grpcServer = GRPCServer(serverConfig)
        _grpcServer.start().then(() => {
          _started = true
          _starting = false
          node.emit('start')
        })

        return node
      },
    },
    stop: {
      value: () => {
        if (_starting) {
          node.once('start', () => node.stop())
          return node
        }
        if (!_started || _stopping) return node

        _stopping = true
        _grpcServer.stop().then(() => {
          _started = false
          _stopping = false
          _grpcServer = null
          node.emit('stop')
        })

        return node
      },
    },
    isStarting: {
      get: () => _starting,
    },
    isStopping: {
      get: () => _stopping,
    },
    isStarted: {
      get: () => _started,
    },
  })
}
