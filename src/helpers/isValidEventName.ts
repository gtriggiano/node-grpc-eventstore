import { isEmpty, isString } from 'lodash'

export const isValidEventName = (x: any): x is string =>
  isString(x) && !isEmpty(x.trim())
