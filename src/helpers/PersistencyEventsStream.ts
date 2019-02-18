// @ts-ignore
import EventEmitter from 'eventemitter3'
import { fromEvent, merge, Observable, throwError } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { flatMap, takeUntil } from 'rxjs/operators'

import {
  PersistenceAvailabilityError,
  PersistencyAdapterQueryEmitter,
  StoredEvent,
} from '../types'

export const PersistencyEventsStream = (
  results: PersistencyAdapterQueryEmitter
): Observable<StoredEvent> => {
  const eventsStream = fromEvent<StoredEvent>(results, 'event')
  const errorsStream = fromEvent<PersistenceAvailabilityError>(
    results,
    'error'
  ).pipe(flatMap(e => throwError(e)))
  const endStream = fromEvent(results, 'end')

  return eventsStream.pipe<StoredEvent, StoredEvent>(
    stream => merge(stream, errorsStream),
    takeUntil(endStream)
  )
}
