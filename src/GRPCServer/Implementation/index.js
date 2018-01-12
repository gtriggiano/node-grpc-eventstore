import AppendEventsToMultipleStreams from './AppendEventsToMultipleStreams'
import AppendEventsToStream from './AppendEventsToStream'
import CatchUpWithStore from './CatchUpWithStore'
import CatchUpWithStream from './CatchUpWithStream'
import CatchUpWithStreamType from './CatchUpWithStreamType'
import Ping from './Ping'
import ReadStoreForward from './ReadStoreForward'
import ReadStreamForward from './ReadStreamForward'
import ReadStreamTypeForward from './ReadStreamTypeForward'
import SubscribeToStore from './SubscribeToStore'
import SubscribeToStream from './SubscribeToStream'
import SubscribeToStreamType from './SubscribeToStreamType'

export default function RPCImplementation (config) {
  return {
    appendEventsToMultipleStreams: AppendEventsToMultipleStreams(config),
    appendEventsToStream: AppendEventsToStream(config),
    catchUpWithStore: CatchUpWithStore(config),
    catchUpWithStream: CatchUpWithStream(config),
    catchUpWithStreamType: CatchUpWithStreamType(config),
    ping: Ping(config),
    readStoreForward: ReadStoreForward(config),
    readStreamForward: ReadStreamForward(config),
    readStreamTypeForward: ReadStreamTypeForward(config),
    subscribeToStore: SubscribeToStore(config),
    subscribeToStream: SubscribeToStream(config),
    subscribeToStreamType: SubscribeToStreamType(config),
  }
}
