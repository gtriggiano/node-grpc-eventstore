import { isObject, isString } from 'lodash'

import isValidStreamType from './isValidStreamType'

export default function isValidStream (stream) {
  return (
    isObject(stream) && isValidStreamType(stream.type) && isString(stream.id)
  )
}
