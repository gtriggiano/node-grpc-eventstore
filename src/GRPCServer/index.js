import grpc from 'grpc'

import { getProtocol } from '../Protocol'
import Implementation from './Implementation'

export default function GRPCServer ({
  port,
  credentials,
  db,
  isStreamWritable,
  eventsStream,
  onEventsStored,
}) {
  let _server

  function makeGRPCServer () {
    let server = new grpc.Server()
    server.addService(
      getProtocol().EventStore.service,
      Implementation({
        db,
        isStreamWritable,
        eventsStream,
        onEventsStored,
      }),
    )
    return server
  }

  return Object.defineProperties(
    {},
    {
      start: {
        value: () =>
          Promise.resolve().then(() => {
            _server = makeGRPCServer()
            _server.bind(`0.0.0.0:${port}`, credentials)
            _server.start()
            return null
          }),
      },
      stop: {
        value: () =>
          new Promise((resolve) => {
            let stopped = false
            _server.tryShutdown(() => {
              stopped = true
              _server = null
              resolve()
            })
            setTimeout(() => {
              if (stopped) return
              _server.forceShutdown()
              _server = null
              resolve()
            }, 2000)
          }),
      },
    },
  )
}
