import { ConnectableObservable } from 'rxjs'

import { IEventStoreServer } from '../proto'
import { DatabaseAdapter, DbStoredEvent, WritableStreamChecker } from '../types'

import { AppendEventsToMultipleStreams } from './AppendEventsToMultipleStreams'
import { AppendEventsToStream } from './AppendEventsToStream'
import { CatchUpWithStore } from './CatchUpWithStore'
import { CatchUpWithStream } from './CatchUpWithStream'
import { CatchUpWithStreamType } from './CatchUpWithStreamType'
import { Heartbeat } from './Heartbeat'
import { Ping } from './Ping'
import { ReadStoreForward } from './ReadStoreForward'
import { ReadStreamForward } from './ReadStreamForward'
import { ReadStreamTypeForward } from './ReadStreamTypeForward'
import { SubscribeToStore } from './SubscribeToStore'
import { SubscribeToStream } from './SubscribeToStream'
import { SubscribeToStreamType } from './SubscribeToStreamType'

export interface ImplementationConfiguration {
  readonly db: DatabaseAdapter
  readonly isStreamWritable: WritableStreamChecker
  readonly eventsStream: ConnectableObservable<DbStoredEvent>
  readonly onEventsStored: (storedEvents: ReadonlyArray<DbStoredEvent>) => void
}

export const Implementation = (
  config: ImplementationConfiguration
): IEventStoreServer => ({
  appendEventsToMultipleStreams: AppendEventsToMultipleStreams(config),
  appendEventsToStream: AppendEventsToStream(config),
  catchUpWithStore: CatchUpWithStore(config),
  catchUpWithStream: CatchUpWithStream(config),
  catchUpWithStreamType: CatchUpWithStreamType(config),
  heartbeat: Heartbeat(),
  ping: Ping(),
  readStoreForward: ReadStoreForward(config),
  readStreamForward: ReadStreamForward(config),
  readStreamTypeForward: ReadStreamTypeForward(config),
  subscribeToStore: SubscribeToStore(config),
  subscribeToStream: SubscribeToStream(config),
  subscribeToStreamType: SubscribeToStreamType(config),
})
