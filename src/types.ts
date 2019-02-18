import EventEmitter from 'eventemitter3'
// tslint:disable-next-line:no-submodule-imports
import { Either } from 'fp-ts/lib/Either'
import StrictEventEmitter from 'strict-event-emitter-types'

import { Messages } from './proto'

export type WritableStreamChecker = (stream: Stream) => boolean

export interface DatabaseStoredEvent extends Messages.StoredEvent.AsObject {
  readonly stream: Stream
}

export interface DatabaseAdapter {
  readonly appendInsertions: (
    insertions: ReadonlyArray<StreamInsertion>,
    transactionId: string,
    correlationId: string
  ) => DatabaseAdapterInsertionEmitter
  readonly getEvents: (
    request: ReadStoreForwardRequest
  ) => DatabaseAdapterQueryEmitter
  readonly getEventsByStream: (
    request: ReadStreamForwardRequest
  ) => DatabaseAdapterQueryEmitter
  readonly getEventsByStreamType: (
    request: ReadStreamTypeForwardRequest
  ) => DatabaseAdapterQueryEmitter
  readonly getLastStoredEvent: () => Promise<
    Either<PersistenceAvailabilityError, DatabaseStoredEvent | void>
  >
}

export interface StreamInsertion extends Messages.StreamInsertion.AsObject {
  readonly stream: Stream
}

export type DatabaseAdapterInsertionEmitter = StrictEventEmitter<
  EventEmitter,
  {
    readonly 'stored-events': ReadonlyArray<DatabaseStoredEvent>
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

export type ReadStoreForwardRequest = Messages.ReadStoreForwardRequest.AsObject
export interface ReadStreamForwardRequest
  extends Messages.ReadStreamForwardRequest.AsObject {
  readonly stream: Stream
}
export type ReadStreamTypeForwardRequest = Required<
  Messages.ReadStreamTypeForwardRequest.AsObject
>

export type DatabaseAdapterQueryEmitter = StrictEventEmitter<
  EventEmitter,
  {
    readonly event: DatabaseStoredEvent
    readonly end: void
    readonly error: PersistenceAvailabilityError
  }
>

export interface Stream extends Required<Messages.Stream.AsObject> {
  readonly type: StreamType
}

export type StreamType = Messages.StreamType.AsObject
