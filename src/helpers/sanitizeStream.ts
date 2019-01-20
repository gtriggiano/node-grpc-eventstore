import { Stream } from '../types'

import { sanitizeStreamType } from './sanitizeStreamType'

export const sanitizeStream = (stream: Stream) => ({
  id: stream.id.trim(),
  type: sanitizeStreamType(stream.type),
})
