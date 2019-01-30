// tslint:disable no-expression-statement
import { IEventStoreServer, Messages } from '../proto'

type PingFactory = () => IEventStoreServer['ping']

export const Ping: PingFactory = () => (_, callback): void => {
  callback(null, new Messages.Empty())
}
