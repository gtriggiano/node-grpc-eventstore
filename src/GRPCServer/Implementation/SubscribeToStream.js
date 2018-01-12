import assert from 'assert'

import isValidStream from '../helpers/isValidStream'
import sanitizeStream from '../helpers/sanitizeStream'

export default function SubscribeToStream ({ eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()

    call.once('data', (request) => {
      try {
        assert(
          isValidStream(request.stream),
          `stream is an object like {id: String, type: {context: String, name: String}}`,
        )
      } catch (e) {
        return call.emit(
          'error',
          new TypeError(
            `stream should be an object like {id: String, type: {context: String, name: String}}`,
          ),
        )
      }

      let observedStream = sanitizeStream(request.stream)

      let subscription = eventsStream
        .filter(
          (event) =>
            event.stream.id === observedStream.id &&
            event.stream.type.context === observedStream.type.context &&
            event.stream.type.name === observedStream.type.name,
        )
        .subscribe(
          (event) => call.write(event),
          (error) => call.emit('error', error),
        )

      onClientTermination = () => {
        subscription.unsubscribe()
        call.end()
      }
    })

    call.on('end', () => onClientTermination())
  }
}
