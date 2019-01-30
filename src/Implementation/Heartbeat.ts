// tslint:disable no-expression-statement
import { IEventStoreServer, Messages } from '../proto'

type HeartbeatFactory = () => IEventStoreServer['heartbeat']

export const Heartbeat: HeartbeatFactory = () => call => {
  // tslint:disable no-let
  let onClientTermination = () => call.end()
  let intervalHandler: NodeJS.Timeout

  call.once('data', (request: Messages.HeartbeatRequest) => {
    intervalHandler = setInterval(
      () => call.write(new Messages.Empty()),
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
