import path from 'path'

export * from './EventStoreNode'
export { SimpleStoreBus } from './helpers/SimpleStoreBus'
export { EventStoreBus } from './helpers/SimpleStoreBus'
export { InMemoryPersistencyAdapter } from './InMemoryPersistencyAdapter'
export * from './proto'
export {
  PersistencyAdapter,
  PersistenceConcurrencyError,
  PersistenceAvailabilityError,
  AppendOperationError,
  StoredEvent,
} from './types'

export const PROTOCOL_FILE_PATH = path.resolve(
  __dirname,
  'proto',
  'EventStore.proto'
)
