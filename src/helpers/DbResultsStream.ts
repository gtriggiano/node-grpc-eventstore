import EventEmitter from 'eventemitter3'
import { fromEvent, merge, Observable, throwError } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { flatMap, takeUntil } from 'rxjs/operators'

import { DbStoredEvent } from '../types'

export const DbResultsStream = (
  results: EventEmitter
): Observable<DbStoredEvent> => {
  const eventsStream = fromEvent<DbStoredEvent>(results, 'event')
  const errorsStream = fromEvent(results, 'error').pipe(
    flatMap((e: any) => throwError(e))
  )
  const endStream = fromEvent(results, 'end')

  return eventsStream.pipe<DbStoredEvent, DbStoredEvent>(
    stream => merge(stream, errorsStream),
    takeUntil(endStream)
  )
}
