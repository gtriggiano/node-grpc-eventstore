import { range } from 'lodash'

export default function zeropad (s, minLength = 1) {
  let str = String(s)
  let missingChars = Math.max(minLength - str.length, 0)
  return `${range(missingChars)
    .map(() => `0`)
    .join('')}${str}`
}
