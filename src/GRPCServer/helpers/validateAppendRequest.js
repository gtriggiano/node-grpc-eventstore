import assert from 'assert'
import { every } from 'lodash'

import isANotEmptyString from './isANotEmptyString'
import isValidStream from './isValidStream'

export default function validateAppendRequest (appendRequest, isStreamWritable) {
  assert(
    isValidStream(appendRequest.stream),
    `stream is not valid. Received ${JSON.stringify(appendRequest.stream)}`,
  )
  assert(
    appendRequest.expectedSequenceNumber >= -2,
    `expectedSequenceNumber should be >= -2`,
  )
  assert(
    appendRequest.events && appendRequest.events.length,
    `events should be a list of one or more events`,
  )
  assert(
    every(appendRequest.events, (event) => isANotEmptyString(event.type)),
    `all events should have a type which should be a non empty string`,
  )

  if (!isStreamWritable(appendRequest.stream)) {
    throw new Error(
      `NOT_WRITABLE_STREAM|${JSON.stringify(appendRequest.stream)}`,
    )
  }
}
