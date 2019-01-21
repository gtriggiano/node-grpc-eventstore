import 'jest'
import { every } from 'lodash'

import { Empty, HeartbeatRequest } from '../../../dist/main'
import { Heartbeat } from '../../../dist/main/Implementation/Heartbeat'

import Mocks from './Mocks'

describe('Heartbeat factory', () => {
  it('is a function', () => {
    expect(typeof Heartbeat).toBe('function')
  })
  it('returns (call) => {...}', () => {
    const heartbeat = Heartbeat()
    expect(typeof heartbeat).toBe('function')
    expect(heartbeat.length).toBe(1)
  })
})

describe('heartbeat(call) handler', () => {
  it('calls call.write(emptyMessage) at the interval specified by the first heartbeatRequest received', done => {
    const { call, callObserver, config } = Mocks()
    Heartbeat(config)(call)

    const receivedSignals = []
    callObserver.on('write', message => {
      receivedSignals.push(message)
    })

    const request = new HeartbeatRequest()
    request.setInterval(500)

    call.emit('data', request)

    setTimeout(() => {
      call.emit('end')
      expect(receivedSignals.length).toBe(4)
      expect(every(receivedSignals, message => message instanceof Empty)).toBe(
        true
      )
      done()
    }, 2200)
  })
  it('further heartbeatRequest(s) do not modify the interval rate', done => {
    const { call, callObserver, config } = Mocks()
    Heartbeat(config)(call)

    const receivedSignals = []
    callObserver.on('write', message => {
      receivedSignals.push(message)
    })

    const request = new HeartbeatRequest()
    request.setInterval(500)
    call.emit('data', request)

    setTimeout(() => {
      const request = new HeartbeatRequest()
      request.setInterval(1000)
      call.emit('data', request)
    }, 200)

    setTimeout(() => {
      call.emit('end')
      expect(receivedSignals.length).toBe(4)
      done()
    }, 2200)
  })
  it('if specified interval is less than 300ms it is forced to 300ms', done => {
    const { call, callObserver, config } = Mocks()
    Heartbeat(config)(call)

    const receivedSignals = []
    callObserver.on('write', message => {
      receivedSignals.push(message)
    })

    const request = new HeartbeatRequest()
    request.setInterval(100)

    call.emit('data', request)

    setTimeout(() => {
      call.emit('end')
      expect(receivedSignals.length).toBe(7)
      done()
    }, 2200)
  })
  it("when client'stream ends the server'stream ends", done => {
    const { call, callObserver, config } = Mocks()
    Heartbeat(config)(call)

    const request = new HeartbeatRequest()
    request.setInterval(300)

    let serverStreamEnded = false
    const receivedMessages = []
    callObserver.on('write', message => receivedMessages.push(message))
    callObserver.on('end', () => {
      serverStreamEnded = true
    })
    call.emit('data', request)

    setTimeout(() => {
      call.emit('end')
    }, 400)

    setTimeout(() => {
      expect(serverStreamEnded).toBe(true)
      expect(receivedMessages.length).toBe(1)
      done()
    }, 700)
  })
  it("if client'stream ends before sending an heartbeat request then the server'stream ends", () => {
    const { call, callObserver, config } = Mocks()
    Heartbeat(config)(call)

    let serverStreamEnded = false
    callObserver.on('end', () => {
      serverStreamEnded = true
    })

    call.emit('end')
    expect(serverStreamEnded).toBe(true)
  })
})
