import EventEmitter from 'eventemitter3'
import { flatten } from 'lodash'

import { zeropad } from '../helpers/zeropad'
import {
  DatabaseAdapter,
  DbStoredEvent,
  ReadStoreForwardRequest,
  ReadStreamForwardRequest,
  ReadStreamTypeForwardRequest,
  Stream,
  StreamInsertion,
  StreamType,
} from '../types'

interface EventToStore {
  readonly name: string
  readonly payload: string
  readonly sequenceNumber: number
  readonly stream: Stream
}

interface InsertionConcurrencyFailure {
  readonly message: 'STREAM_DOES_NOT_EXIST' | 'EXPECTED_STREAM_SIZE_MISMATCH'
  readonly stream: Stream
  readonly actualStreamSize: number
  readonly expectedStreamSize: number
}

const padId = (id: string | number) => zeropad(`${id}`, 25)

export const InMemoryDatabaseAdapter = (
  initialEvents: ReadonlyArray<DbStoredEvent> = []
): DatabaseAdapter &
  EventEmitter & {
    readonly getAllEvents: () => ReadonlyArray<DbStoredEvent>
  } => {
  const dbAdapter = new EventEmitter()

  // tslint:disable-next-line:readonly-array
  const events: DbStoredEvent[] = initialEvents.slice()

  const getEventsOfStream = (stream: Stream) =>
    events.filter(
      event =>
        event.stream.type.context === stream.type.context &&
        event.stream.type.name === stream.type.name &&
        event.stream.id === stream.id
    )

  const getEventsOfStreamType = (streamType: StreamType) =>
    events.filter(
      event =>
        event.stream.type.context === streamType.context &&
        event.stream.type.name === streamType.name
    )

  const getStreamSize = (stream: Stream) => getEventsOfStream(stream).length

  const processInsertion = (
    insertion: StreamInsertion,
    actualStreamSize: number
  ): ReadonlyArray<EventToStore> | InsertionConcurrencyFailure => {
    const { stream, events: eventsToStore, expectedStreamSize } = insertion

    // tslint:disable-next-line:no-if-statement
    if (expectedStreamSize !== -2) {
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize === -1 && !actualStreamSize) {
        return {
          actualStreamSize,
          expectedStreamSize,
          message: 'STREAM_DOES_NOT_EXIST',
          stream,
        }
      }
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize !== actualStreamSize) {
        return {
          actualStreamSize,
          expectedStreamSize,
          message: 'EXPECTED_STREAM_SIZE_MISMATCH',
          stream,
        }
      }
    }

    return eventsToStore.map(({ name, payload }, idx) => ({
      name,
      payload,
      sequenceNumber: actualStreamSize + idx + 1,
      stream,
    }))
  }

  const getAllEvents = () => events.slice()
  const appendEvents = (
    insertions: ReadonlyArray<StreamInsertion>,
    transactionId: string,
    correlationId: string
  ) => {
    const dbResults: EventEmitter<
      'stored-events' | 'update' | 'error'
    > = new EventEmitter()

    // tslint:disable no-expression-statement no-if-statement no-object-mutation
    process.nextTick(() => {
      const processedInsertions = insertions.map(insertion =>
        processInsertion(insertion, getStreamSize(insertion.stream))
      )
      const failures = processedInsertions.filter<InsertionConcurrencyFailure>(
        (x: any): x is InsertionConcurrencyFailure => !Array.isArray(x)
      )

      if (failures.length) {
        const error = new Error('CONCURRENCY')
        error.name = 'CONCURRENCY'
        ;(error as any).failures = failures

        dbResults.emit('error', error)
      } else {
        const now = new Date().toISOString()
        const totalEvents = events.length
        const eventsToAppend: ReadonlyArray<DbStoredEvent> = flatten(
          (processedInsertions as unknown) as ReadonlyArray<EventToStore>
        ).map((event, idx) => ({
          ...event,
          correlationId,
          id: `${totalEvents + 1 + idx}`,
          storedOn: now,
          transactionId,
        }))

        events.push(...eventsToAppend)

        dbResults.emit('stored-events', eventsToAppend)
        dbAdapter.emit('update')
      }
    })
    // tslint:enable

    return dbResults
  }
  const getEvents = ({ fromEventId, limit }: ReadStoreForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const paddedFromEventId = padId(fromEventId)
      const foundEvents = events
        .filter(({ id }) => padId(id) > paddedFromEventId)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }
  const getEventsByStream = ({
    stream,
    fromSequenceNumber,
    limit,
  }: ReadStreamForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const foundEvents = getEventsOfStream(stream)
        .filter(({ sequenceNumber }) => sequenceNumber > fromSequenceNumber)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }
  const getEventsByStreamType = ({
    streamType,
    fromEventId,
    limit,
  }: ReadStreamTypeForwardRequest) => {
    const dbResults: EventEmitter<'event' | 'end'> = new EventEmitter()

    // tslint:disable-next-line:no-expression-statement
    process.nextTick(() => {
      const paddedFromEventId = padId(fromEventId)
      const foundEvents = getEventsOfStreamType(streamType)
        .filter(({ id }) => padId(id) > paddedFromEventId)
        .slice(0, limit && limit > 0 ? limit : undefined)

      // tslint:disable no-expression-statement
      foundEvents.forEach(event => {
        dbResults.emit('event', event)
      })
      dbResults.emit('end')
      // tslint:enable
    })

    return dbResults
  }

  return Object.assign(dbAdapter, {
    appendEvents,
    getAllEvents,
    getEvents,
    getEventsByStream,
    getEventsByStreamType,
  })
}
