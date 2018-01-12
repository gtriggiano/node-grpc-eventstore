export default function SubscribeToStore ({ eventsStream }) {
  return (call) => {
    let onClientTermination = () => call.end()

    call.once('data', () => {
      let subscription = eventsStream.subscribe(
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
