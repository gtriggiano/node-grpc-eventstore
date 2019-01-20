import EventEmitter from 'eventemitter3'

export type WritableStreamChecker = (stream: Stream) => boolean

export interface StreamType {
  readonly context: string
  readonly name: string
}

export interface Stream {
  readonly id: string
  readonly type: StreamType
}

export interface Event {
  readonly name: string
  readonly payload: string
}

export interface DbStoredEvent {
  readonly id: string
  readonly stream: Stream
  readonly name: string
  readonly payload: string
  readonly storedOn: string
  readonly sequenceNumber: number
  readonly correlationId: string
  readonly transactionId: string
}

export interface StreamInsertion {
  readonly stream: Stream
  readonly expectedStreamSize: number
  readonly events: ReadonlyArray<Event>
}

export interface ReadStoreForwardRequest {
  readonly fromEventId: string
  readonly limit: number | undefined
}

export interface ReadStreamForwardRequest {
  readonly stream: Stream
  readonly fromSequenceNumber: number
  readonly limit: number | undefined
}

export interface ReadStreamTypeForwardRequest {
  readonly streamType: StreamType
  readonly fromEventId: string
  readonly limit: number | undefined
}

// tslint:disable readonly-keyword
export interface DbUnavaliableError {
  name: 'UNAVAILABLE'
}

export interface DbConcurrencyError {
  name: 'CONCURRENCY'
  failures: ReadonlyArray<{
    stream: Stream
    currentSequenceNumber: number
    expectedSequenceNumber: number
  }>
}

export type DbError = (DbUnavaliableError | DbConcurrencyError) & {
  readonly message: string
}
// tslint:enable

export interface DatabaseAdapter {
  readonly appendEvents: (
    insertions: ReadonlyArray<StreamInsertion>,
    transactionId: string,
    correlationId: string
  ) => EventEmitter<'stored-events' | 'update' | 'error'>
  readonly getEvents: (
    request: ReadStoreForwardRequest
  ) => EventEmitter<'event' | 'end' | 'error'>
  readonly getEventsByStream: (
    request: ReadStreamForwardRequest
  ) => EventEmitter<'event' | 'end' | 'error'>
  readonly getEventsByStreamType: (
    request: ReadStreamTypeForwardRequest
  ) => EventEmitter<'event' | 'end' | 'error'>
  readonly [key: string]: any
}
