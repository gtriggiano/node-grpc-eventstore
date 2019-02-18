import EventEmitter from 'eventemitter3'
// tslint:disable-next-line:no-submodule-imports
import { right } from 'fp-ts/lib/Either'
import { flatten, last } from 'lodash'

import { zeropad } from '../helpers/zeropad'
import {
  InsertionConcurrencyFailure,
  PersistencyAdapter,
  PersistencyAdapterInsertionEmitter,
  PersistencyAdapterQueryEmitter,
  ReadStoreForwardRequest,
  ReadStreamForwardRequest,
  ReadStreamTypeForwardRequest,
  StoredEvent,
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

const padId = (id: string | number) => zeropad(`${id}`, 25)

interface InMemoryPersistencyAdapterMethods extends PersistencyAdapter {
  readonly getAllEvents: () => ReadonlyArray<StoredEvent>
}

type InMemoryPersistencyAdapter = InMemoryPersistencyAdapterMethods &
  EventEmitter

export const InMemoryPersistencyAdapter = (
  initialEvents: ReadonlyArray<StoredEvent> = []
): InMemoryPersistencyAdapter => {
  // tslint:disable-next-line:readonly-array
  const events: StoredEvent[] = initialEvents.slice()

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
    currentStreamSize: number
  ): ReadonlyArray<EventToStore> | InsertionConcurrencyFailure => {
    const { stream, eventsList, expectedStreamSize } = insertion

    // tslint:disable-next-line:no-if-statement
    if (expectedStreamSize !== -2) {
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize === -1 && !currentStreamSize) {
        return {
          currentStreamSize,
          expectedStreamSize,
          stream,
          type: 'STREAM_DOES_NOT_EXIST',
        }
      }
      // tslint:disable-next-line:no-if-statement
      if (expectedStreamSize !== currentStreamSize) {
        return {
          currentStreamSize,
          expectedStreamSize,
          stream,
          type: 'EXPECTED_STREAM_SIZE_MISMATCH',
        }
      }
    }

    return eventsList.map(({ name, payload }, idx) => ({
      name,
      payload,
      sequenceNumber: currentStreamSize + idx + 1,
      stream,
    }))
  }

  const adapter: InMemoryPersistencyAdapter = Object.assign<
    EventEmitter,
    InMemoryPersistencyAdapterMethods
  >(new EventEmitter(), {
    appendInsertions: (insertions, transactionId, correlationId) => {
      const emitter: PersistencyAdapterInsertionEmitter = new EventEmitter()

      // tslint:disable no-expression-statement no-if-statement no-object-mutation
      process.nextTick(() => {
        const processedInsertions = insertions.map(insertion =>
          processInsertion(insertion, getStreamSize(insertion.stream))
        )
        const failures = processedInsertions.filter<
          InsertionConcurrencyFailure
        >((x: any): x is InsertionConcurrencyFailure => !Array.isArray(x))

        if (failures.length) {
          emitter.emit('error', {
            failures,
            type: 'CONCURRENCY',
          })
        } else {
          const now = new Date().toISOString()
          const totalEvents = events.length
          const eventsToAppend: ReadonlyArray<StoredEvent> = flatten(
            (processedInsertions as unknown) as ReadonlyArray<
              ReadonlyArray<EventToStore>
            >
          ).map((event, idx) => ({
            ...event,
            correlationId,
            id: `${totalEvents + 1 + idx}`,
            storedOn: now,
            transactionId,
          }))

          events.push(...eventsToAppend)

          emitter.emit('stored-events', eventsToAppend)
          emitter.emit('update')
        }
      })
      // tslint:enable

      return emitter
    },
    getAllEvents: () => events.slice(),
    getEvents: ({ fromEventId, limit }: ReadStoreForwardRequest) => {
      const emitter: PersistencyAdapterQueryEmitter = new EventEmitter()

      // tslint:disable-next-line:no-expression-statement
      process.nextTick(() => {
        const paddedFromEventId = padId(fromEventId)
        const foundEvents = events
          .filter(({ id }) => padId(id) > paddedFromEventId)
          .slice(0, limit && limit > 0 ? limit : undefined)

        // tslint:disable no-expression-statement
        foundEvents.forEach(event => {
          emitter.emit('event', event)
        })
        emitter.emit('end')
        // tslint:enable
      })

      return emitter
    },
    getEventsByStream: ({
      stream,
      fromSequenceNumber,
      limit,
    }: ReadStreamForwardRequest) => {
      const emitter: PersistencyAdapterQueryEmitter = new EventEmitter()

      // tslint:disable-next-line:no-expression-statement
      process.nextTick(() => {
        const foundEvents = getEventsOfStream(stream)
          .filter(({ sequenceNumber }) => sequenceNumber > fromSequenceNumber)
          .slice(0, limit && limit > 0 ? limit : undefined)

        // tslint:disable no-expression-statement
        foundEvents.forEach(event => {
          emitter.emit('event', event)
        })
        emitter.emit('end')
        // tslint:enable
      })

      return emitter
    },
    getEventsByStreamType: ({
      streamType,
      fromEventId,
      limit,
    }: ReadStreamTypeForwardRequest) => {
      const emitter: PersistencyAdapterQueryEmitter = new EventEmitter()

      // tslint:disable-next-line:no-expression-statement
      process.nextTick(() => {
        const paddedFromEventId = padId(fromEventId)
        const foundEvents = getEventsOfStreamType(streamType)
          .filter(({ id }) => padId(id) > paddedFromEventId)
          .slice(0, limit && limit > 0 ? limit : undefined)

        // tslint:disable no-expression-statement
        foundEvents.forEach(event => {
          emitter.emit('event', event)
        })
        emitter.emit('end')
        // tslint:enable
      })

      return emitter
    },
    getLastStoredEvent: async () => right(last(events)),
  })

  return adapter
}
