import fs from 'fs'
import path from 'path'
import uuid from 'uuid'
import { range, sample, pick, random } from 'lodash'

let now = Date.now()

const EVENTS_FILE = path.resolve(__dirname, 'events.json')
const { padId } = require(path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'InMemoryAdapter',
))

const eventTypes = range(16).map((n) => `SomethingHappened_${n}`)
const contexts = range(5).map((n) => `Context_${n}`)
const streamNames = range(6).map((n) => `Name_${n}`)
const correlationIds = range(10).map(() => uuid())

const streams = range(10).map((n, idx) => ({
  id: uuid(),
  type: {
    context: contexts[idx % contexts.length],
    name: streamNames[idx % streamNames.length],
  },
  version: 0,
}))

const events = range(1, 200).map((n) => {
  let stream = sample(streams)
  stream.version++
  let eventType = sample(eventTypes)

  let event = {
    id: padId(n),
    type: eventType,
    stream: pick(stream, ['id', 'type']),
    storedOn: new Date(now + n * random(5, 2000)).toISOString(),
    sequenceNumber: stream.version,
    data: `data_${n}`,
    transactionId: uuid(),
    correlationId: random(1, 100) > 70 ? sample(correlationIds) : null,
  }

  return event
})

let eventsString = JSON.stringify(events, null, 2)
console.log(eventsString)
fs.writeFileSync(EVENTS_FILE, eventsString)
