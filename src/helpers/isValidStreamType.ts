import assert from 'assert'
import { isObject, isString } from 'lodash'

import { StreamType } from '../types'

import { isANotEmptyString } from './isANotEmptyString'

export const isValidStreamType = (
  x: any,
  throwError?: boolean
): x is StreamType => {
  try {
    assert(isObject(x) && isString(x.context) && isANotEmptyString(x.name))
    return true
  } catch (error) {
    // tslint:disable-next-line:no-if-statement
    if (throwError) throw error
    return false
  }
}
