import * as t from 'io-ts'

import { StreamType } from './StreamType'

export const Stream = t.type(
  {
    id: t.string,
    type: StreamType,
  },
  'Stream'
)
