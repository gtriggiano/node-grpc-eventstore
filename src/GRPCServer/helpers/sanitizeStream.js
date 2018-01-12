import sanitizeStreamType from './sanitizeStreamType'

export default function sanitizeStream (stream) {
  return {
    type: sanitizeStreamType(stream.type),
    id: stream.id.trim(),
  }
}
