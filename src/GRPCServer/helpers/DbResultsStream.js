import Rx from 'rxjs/Rx'

export default function DbResultsStream (results) {
  return Rx.Observable.fromEvent(results, 'event')
    .merge(
      Rx.Observable.fromEvent(results, 'error').flatMap((e) =>
        Rx.Observable.throw(e),
      ),
    )
    .takeUntil(Rx.Observable.fromEvent(results, 'end'))
}
