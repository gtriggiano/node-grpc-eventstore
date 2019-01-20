// tslint:disable no-expression-statement
import * as GRPC from 'grpc'

import { Empty, HeartbeatRequest } from '../proto'

type HeartbeatFactory = () => GRPC.handleBidiStreamingCall<
  HeartbeatRequest,
  Empty
>

export const Heartbeat: HeartbeatFactory = () => call => {
  // tslint:disable no-let
  let onClientTermination = () => call.end()
  let intervalHandler: NodeJS.Timeout

  call.once('data', (request: HeartbeatRequest) => {
    intervalHandler = setInterval(
      () => call.write(new Empty()),
      Math.max(300, request.getInterval())
    )
    onClientTermination = () => {
      clearInterval(intervalHandler)
      call.removeAllListeners()
      call.end()
    }
  })

  call.on('end', () => onClientTermination())
}
