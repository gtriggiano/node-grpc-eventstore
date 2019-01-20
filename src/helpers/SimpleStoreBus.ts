import EventEmitter from 'eventemitter3'

export type EventStoreBus = EventEmitter & {
  // tslint:disable-next-line:readonly-keyword
  publish: (eventsString: string) => void

  readonly safeOrderTimeframe?: number
}

export const SimpleStoreBus = (): EventStoreBus => {
  const storeBus = new EventEmitter() as EventStoreBus

  // tslint:disable-next-line:no-object-mutation
  storeBus.publish = (eventsString: string): void => {
    // tslint:disable-next-line:no-expression-statement
    storeBus.emit('events', eventsString)
  }

  return storeBus
}
