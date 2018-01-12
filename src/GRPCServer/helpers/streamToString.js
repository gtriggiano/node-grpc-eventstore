export default function streamToString (stream) {
  return `${stream.type.context}:${stream.type.name}:${stream.id}`
}
