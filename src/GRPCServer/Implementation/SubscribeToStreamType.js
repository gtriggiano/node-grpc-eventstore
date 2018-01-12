import assert from 'assert'

import isValidStreamType from '../helpers/isValidStreamType'
import sanitizeStreamType from '../helpers/sanitizeStreamType'

export default function SubscribeToStreamType ({ eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()

    call.once('data', (request) => {
      try {
        assert(
          isValidStreamType(request.streamType),
          `streamType is an object like {context: String, name: String}`,
        )
      } catch (e) {
        return call.emit(
          'error',
          new TypeError(
            'streamType should be an object like {context: String, name: String}',
          ),
        )
      }

      let observedType = sanitizeStreamType(request.streamType)

      let subscription = eventsStream
        .filter(
          (event) =>
            event.stream.type.context === observedType.context &&
            event.stream.type.name === observedType.name,
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
