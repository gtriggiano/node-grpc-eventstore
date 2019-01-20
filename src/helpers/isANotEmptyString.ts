import { isEmpty, isString } from 'lodash'

export const isANotEmptyString = (x: any): x is string =>
  isString(x) && !isEmpty(x.trim())
