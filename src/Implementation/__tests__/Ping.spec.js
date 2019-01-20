import 'jest'

import { Empty } from '../../../dist/main'
import { Ping } from '../../../dist/main/Implementation/Ping'

import Mocks from './Mocks'

describe('Ping factory', () => {
  it('is a function', () => {
    expect(typeof Ping).toBe('function')
  })
  it('returns (call, callback) => {...}', () => {
    const ping = Ping()
    expect(typeof ping).toBe('function')
    expect(ping.length).toBe(2)
  })
})

describe('ping(call, callback) handler', () => {
  it('calls callback(null, emptyMessage)', done => {
    const { call } = Mocks()
    const ping = Ping()
    ping(call, (error, response) => {
      expect(error).toBeNull()
      expect(response instanceof Empty).toBe(true)

      done()
    })
  })
})
