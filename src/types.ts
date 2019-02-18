import EventEmitter from 'eventemitter3'
// tslint:disable-next-line:no-submodule-imports
import { Either } from 'fp-ts/lib/Either'
import * as GRPC from 'grpc'
import StrictEventEmitter from 'strict-event-emitter-types'

import { Omit } from 'lodash'
import { Messages } from './proto'

export type WritableStreamChecker = (
  stream: Stream,
  callMetadata: GRPC.Metadata
) => boolean

export interface StoredEvent extends Messages.StoredEvent.AsObject {
  readonly stream: Stream
}

export interface PersistencyAdapter {
  readonly appendInsertions: (
    insertions: ReadonlyArray<StreamInsertion>,
    transactionId: string,
    correlationId: string
  ) => PersistencyAdapterInsertionEmitter
  readonly getEvents: (
    request: ReadStoreForwardRequest
  ) => PersistencyAdapterQueryEmitter
  readonly getEventsByStream: (
    request: ReadStreamForwardRequest
  ) => PersistencyAdapterQueryEmitter
  readonly getEventsByStreamType: (
    request: ReadStreamTypeForwardRequest
  ) => PersistencyAdapterQueryEmitter
  readonly getLastStoredEvent: () => Promise<
    Either<PersistenceAvailabilityError, StoredEvent | void>
  >
}

export interface StreamInsertion extends Messages.StreamInsertion.AsObject {
  readonly stream: Stream
}

export type PersistencyAdapterInsertionEmitter = StrictEventEmitter<
  EventEmitter,
  {
    readonly 'stored-events': ReadonlyArray<StoredEvent>
    readonly update: void
    readonly error: AppendOperationError
  }
>

export type AppendOperationError =
  | PersistenceAvailabilityError
  | PersistenceConcurrencyError

export interface PersistenceAvailabilityError {
  readonly type: 'AVAILABILITY'
  readonly name: string
  readonly message: string
}

export interface InsertionConcurrencyFailure {
  readonly type: 'STREAM_DOES_NOT_EXIST' | 'EXPECTED_STREAM_SIZE_MISMATCH'
  readonly stream: Stream
  readonly currentStreamSize: number
  readonly expectedStreamSize: number
}

export interface PersistenceConcurrencyError {
  readonly type: 'CONCURRENCY'
  readonly failures: ReadonlyArray<InsertionConcurrencyFailure>
}

export type ReadStoreForwardRequest = Omit<
  Messages.ReadStoreForwardRequest.AsObject,
  'limit'
> & {
  readonly limit?: number
}
export type ReadStreamForwardRequest = Omit<
  Required<Messages.ReadStreamForwardRequest.AsObject>,
  'limit'
> & {
  readonly limit?: number
}
export type ReadStreamTypeForwardRequest = Omit<
  Required<Messages.ReadStreamTypeForwardRequest.AsObject>,
  'limit'
> & {
  readonly limit?: number
}

export type PersistencyAdapterQueryEmitter = StrictEventEmitter<
  EventEmitter,
  {
    readonly event: StoredEvent
    readonly end: void
    readonly error: PersistenceAvailabilityError
  }
>

export interface Stream extends Required<Messages.Stream.AsObject> {
  readonly type: StreamType
}

export type StreamType = Messages.StreamType.AsObject
