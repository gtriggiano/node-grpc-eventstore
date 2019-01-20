// tslint:disable no-expression-statement
import * as GRPC from 'grpc'

import { Empty } from '../proto'

type PingFactory = () => GRPC.handleUnaryCall<Empty, Empty>

export const Ping: PingFactory = () => (
  _: GRPC.ServerUnaryCall<Empty>,
  callback: GRPC.sendUnaryData<Empty>
): void => {
  // tslint:disable-next-line:no-expression-statement
  callback(null, new Empty())
}
