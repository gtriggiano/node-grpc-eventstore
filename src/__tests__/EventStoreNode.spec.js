import 'jest'
import { EventEmitter } from 'eventemitter3'

import { EventStoreNode } from '../../dist/main'

describe('EventStoreNode([config]) factory', () => {
  it('is a function', () => {
    expect(typeof EventStoreNode).toBe('function')
  })
  it('returns an EventEmitter', done => {
    const node = EventStoreNode()

    node.on('stop', () => {
      expect(node instanceof EventEmitter).toBe(true)
      done()
    })
    node.start()
    node.stop()
  })
})
