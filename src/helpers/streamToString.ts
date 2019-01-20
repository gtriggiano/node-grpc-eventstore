import { Stream } from '../types'

export const streamToString = (stream: Stream) =>
  `${stream.type.context}:${stream.type.name}${
    stream.id ? `:${stream.id}` : ''
  }`
