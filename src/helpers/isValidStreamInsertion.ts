import assert from 'assert'
import { every, isInteger, isObject } from 'lodash'

import { StreamInsertion } from '../types'

import { isANotEmptyString } from './isANotEmptyString'
import { isValidStream } from './isValidStream'

export const isValidStreamInsertion = (
  x: any,
  throwError?: boolean
): x is StreamInsertion => {
  try {
    assert(isObject(x))

    assert(
      isValidStream(x.stream, true),
      `stream is not valid. Received ${JSON.stringify(x.stream)}`
    )
    assert(
      isInteger(x.expectedStreamSize),
      `expectedStreamSize should be an integer. Received ${JSON.stringify(
        x.expectedStreamSize
      )}`
    )
    assert(x.expectedStreamSize >= -2, `expectedStreamSize should be >= -2`)
    assert(Array.isArray(x.events), `events should be an array`)
    assert(
      every(x.events, event => isANotEmptyString(event.name)),
      `all events should have a name which should be a non empty string`
    )
    return true
  } catch (error) {
    // tslint:disable-next-line:no-if-statement
    if (throwError) throw error
    return false
  }
}
