import { isString, isEmpty } from 'lodash'

export default function isANotEmptyString (str) {
  return isString(str) && !isEmpty(str.trim())
}
