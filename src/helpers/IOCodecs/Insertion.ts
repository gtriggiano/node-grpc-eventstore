import * as t from 'io-ts'

import { Event } from './Event'
import { ExpectedStreamSize } from './ExpectedStreamSize'
import { Stream } from './Stream'

export const Insertion = t.type(
  {
    eventsList: t.array(Event),
    expectedStreamSize: ExpectedStreamSize,
    stream: Stream,
  },
  'Insertion'
)
