import path from 'path'

export * from './EventStoreNode'
export { SimpleStoreBus } from './helpers/SimpleStoreBus'
export { EventStoreBus } from './helpers/SimpleStoreBus'
export { InMemoryDatabaseAdapter } from './InMemoryDatabaseAdapter'
export * from './proto'
export {
  DatabaseAdapter,
  DbConcurrencyError,
  DbUnavaliableError,
  DbError,
  DbStoredEvent,
} from './types'

export const PROTOCOL_FILE_PATH = path.resolve(
  __dirname,
  'proto',
  'EventStore.proto'
)
