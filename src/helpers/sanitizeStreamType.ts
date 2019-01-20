import { StreamType } from '../types'

export const sanitizeStreamType = (type: StreamType) => ({
  context: type.context.trim(),
  name: type.name.trim(),
})
