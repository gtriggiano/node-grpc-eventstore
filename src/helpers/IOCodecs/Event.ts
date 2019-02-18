import * as t from 'io-ts'

import { EventName } from './EventName'

export const Event = t.type(
  {
    name: EventName,
    payload: t.string,
  },
  'Event'
)
