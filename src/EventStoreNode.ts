import EventEmitter from 'eventemitter3'
import * as GRPC from 'grpc'

import { eventsStreamFromStoreBus } from './helpers/eventsStreamFromStoreBus'
import { EventStoreBus, SimpleStoreBus } from './helpers/SimpleStoreBus'
import { Implementation, ImplementationConfiguration } from './Implementation'
import { InMemoryDatabaseAdapter } from './InMemoryDatabaseAdapter'
import { EventStoreService } from './proto/EventStore_grpc_pb'
import { DatabaseAdapter, WritableStreamChecker } from './types'

interface DefaultConfiguration {
  readonly credentials: GRPC.ServerCredentials
  readonly databaseAdapter: DatabaseAdapter
  readonly isStreamWritable: WritableStreamChecker
  readonly port: number
  readonly storeBus: EventStoreBus
}

export type EventStoreNodeConfiguration = Partial<DefaultConfiguration>

export type EventStoreNode = EventEmitter<'start' | 'stop' | 'stopping'> & {
  // tslint:disable readonly-keyword
  start: () => EventStoreNode
  stop: () => EventStoreNode
  // tslint:enable
}

const defaultConfiguration: DefaultConfiguration = {
  credentials: GRPC.ServerCredentials.createInsecure(),
  databaseAdapter: InMemoryDatabaseAdapter(),
  isStreamWritable: () => true,
  port: 50051,
  storeBus: SimpleStoreBus(),
}

export const EventStoreNode = (
  configuration: Partial<EventStoreNodeConfiguration> = {}
): EventStoreNode => {
  const { credentials, databaseAdapter, isStreamWritable, port, storeBus } = {
    ...defaultConfiguration,
    ...configuration,
  }

  const implementationConfiguration: ImplementationConfiguration = {
    db: databaseAdapter,
    eventsStream: eventsStreamFromStoreBus(storeBus),
    isStreamWritable,
    onEventsStored: storedEvents =>
      storeBus.publish(JSON.stringify(storedEvents)),
  }

  const node = new EventEmitter() as EventStoreNode

  // tslint:disable no-expression-statement no-let no-object-mutation no-if-statement
  const server = new GRPC.Server()
  server.addService(
    EventStoreService,
    Implementation(implementationConfiguration)
  )
  server.bind(`0.0.0.0:${port}`, credentials)

  let _isRunning = false
  let _isShutingdown = false

  node.start = () =>
    _isRunning
      ? node
      : _isShutingdown
      ? node.once('stop', () => node.start())
      : (() => {
          server.start()
          _isRunning = true
          node.emit('start')
          return node
        })()

  node.stop = () =>
    !_isRunning || _isShutingdown
      ? node
      : (() => {
          _isShutingdown = true
          node.emit('stopping')
          server.tryShutdown(() => {
            _isShutingdown = false
            _isRunning = false
            node.emit('stop')
          })
          return node
        })()
  // tslint:enable

  return node
}
