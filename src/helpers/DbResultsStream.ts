import EventEmitter from 'eventemitter3'
import { fromEvent, throwError } from 'rxjs'
// tslint:disable-next-line:no-submodule-imports
import { flatMap, merge, takeUntil } from 'rxjs/operators'

import { DbStoredEvent } from '../types'

export const DbResultsStream = (results: EventEmitter) => {
  const eventsStream = fromEvent<DbStoredEvent>(results, 'event')
  const errorsStream = fromEvent(results, 'error').pipe(
    flatMap((e: any) => throwError(e))
  )
  const endStream = fromEvent(results, 'end')

  return eventsStream.pipe(
    merge(errorsStream),
    takeUntil(endStream)
  )
}
