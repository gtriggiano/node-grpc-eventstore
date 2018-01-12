import { isObject, isString } from 'lodash'

import isANotEmptyString from './isANotEmptyString'

export default function isValidStreamType (streamType) {
  return (
    isObject(streamType) &&
    isString(streamType.context) &&
    isANotEmptyString(streamType.name)
  )
}
