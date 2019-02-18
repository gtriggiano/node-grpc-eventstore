// @ts-ignore
import EventEmitter from 'eventemitter3'
import { fromEvent, merge, Observable, throwError } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { flatMap, takeUntil } from 'rxjs/operators'

import { DatabaseAdapterQueryEmitter, DatabaseStoredEvent } from '../types'

export const DbResultsStream = (
  results: DatabaseAdapterQueryEmitter
): Observable<DatabaseStoredEvent> => {
  const eventsStream = fromEvent<DatabaseStoredEvent>(results, 'event')
  const errorsStream = fromEvent(results, 'error').pipe(
    flatMap((e: any) => throwError(e))
  )
  const endStream = fromEvent(results, 'end')

  return eventsStream.pipe<DatabaseStoredEvent, DatabaseStoredEvent>(
    stream => merge(stream, errorsStream),
    takeUntil(endStream)
  )
}
