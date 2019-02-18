import * as t from 'io-ts'

import { StreamTypeNameOrContext } from './StreamTypeNameOrContext'

export const StreamType = t.type(
  {
    context: StreamTypeNameOrContext,
    name: StreamTypeNameOrContext,
  },
  'StreamType'
)
