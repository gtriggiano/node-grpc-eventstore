import { ConnectableObservable } from 'rxjs'

import { IEventStoreServer } from '../proto'
import {
  PersistencyAdapter,
  StoredEvent,
  WritableStreamChecker,
} from '../types'

import { AppendEventsToMultipleStreams } from './AppendEventsToMultipleStreams'
import { AppendEventsToStream } from './AppendEventsToStream'
import { CatchUpWithStore } from './CatchUpWithStore'
import { CatchUpWithStream } from './CatchUpWithStream'
import { CatchUpWithStreamType } from './CatchUpWithStreamType'
import { GetLastEvent } from './GetLastEvent'
import { Heartbeat } from './Heartbeat'
import { Ping } from './Ping'
import { ReadStoreForward } from './ReadStoreForward'
import { ReadStreamForward } from './ReadStreamForward'
import { ReadStreamTypeForward } from './ReadStreamTypeForward'
import { SubscribeToStore } from './SubscribeToStore'
import { SubscribeToStream } from './SubscribeToStream'
import { SubscribeToStreamType } from './SubscribeToStreamType'

export interface ImplementationConfiguration {
  readonly persistency: PersistencyAdapter
  readonly isStreamWritable: WritableStreamChecker
  readonly eventsStream: ConnectableObservable<StoredEvent>
  readonly onEventsStored: (storedEvents: ReadonlyArray<StoredEvent>) => void
}

export const Implementation = (
  config: ImplementationConfiguration
): IEventStoreServer => ({
  appendEventsToMultipleStreams: AppendEventsToMultipleStreams(config),
  appendEventsToStream: AppendEventsToStream(config),
  catchUpWithStore: CatchUpWithStore(config),
  catchUpWithStream: CatchUpWithStream(config),
  catchUpWithStreamType: CatchUpWithStreamType(config),
  getLastEvent: GetLastEvent(config),
  heartbeat: Heartbeat(),
  ping: Ping(),
  readStoreForward: ReadStoreForward(config),
  readStreamForward: ReadStreamForward(config),
  readStreamTypeForward: ReadStreamTypeForward(config),
  subscribeToStore: SubscribeToStore(config),
  subscribeToStream: SubscribeToStream(config),
  subscribeToStreamType: SubscribeToStreamType(config),
})
