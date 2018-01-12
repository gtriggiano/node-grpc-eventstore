export default function sanitizeStreamType (type) {
  return {
    context: type.context.trim(),
    name: type.name.trim(),
  }
}
