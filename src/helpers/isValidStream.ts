import assert from 'assert'
import { isObject, isString } from 'lodash'

import { Stream } from '../types'

import { isValidStreamType } from './isValidStreamType'

export const isValidStream = (x: any, throwError?: boolean): x is Stream => {
  try {
    assert(isObject(x) && isValidStreamType(x.type) && isString(x.id))
    return true
  } catch (error) {
    // tslint:disable-next-line:no-if-statement
    if (throwError) throw error
    return false
  }
}
