import fs from 'fs'
import path from 'path'
import uuid from 'uuid'
import { range, sample, pick, random } from 'lodash'

const EVENTS_FILE = path.resolve(__dirname, 'events.json')

export const generateEvents = () => {
  const now = Date.now()
  const eventNames = range(16).map(n => `SomethingHappened_${n}`)
  const contexts = range(5).map(n => `Context_${n}`)
  const streamNames = range(6).map(n => `Name_${n}`)
  const correlationIds = range(10).map(() => uuid())

  const streams = range(10).map(n => ({
    id: uuid(),
    type: {
      context: contexts[n % contexts.length],
      name: streamNames[n % streamNames.length],
    },
    version: 0,
  }))

  return range(1, 200).map(n => {
    const stream = sample(streams)
    stream.version++

    const event = {
      id: `${n}`,
      stream: pick(stream, ['id', 'type']),
      name: sample(eventNames),
      payload: `payload_${n}`,
      storedOn: new Date(now + n * 10000 + random(1, 9000)).toISOString(),
      sequenceNumber: stream.version,
      correlationId: random(1, 100) > 70 ? sample(correlationIds) : null,
      transactionId: uuid(),
    }

    return event
  })
}

if (require.main === module) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(generateEvents(), null, 2))
}
