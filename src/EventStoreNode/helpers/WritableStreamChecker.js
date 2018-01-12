import { isArray, isEmpty, isString, every, some } from 'lodash'

export default function WritableStreamChecker (writableStreamsPatterns) {
  if (
    !writableStreamsPatterns ||
    !isArray(writableStreamsPatterns) ||
    isEmpty(writableStreamsPatterns) ||
    !every(
      writableStreamsPatterns,
      (str) => isString(str) && !isEmpty(str.trim()),
    )
  ) { return () => true }

  let regexList = writableStreamsPatterns.map((str) => new RegExp(str))
  return (str) => some(regexList, (regex) => regex.test(str))
}
