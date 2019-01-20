import { range } from 'lodash'

export const zeropad = (str: string, minLength = 1): string => {
  const missingChars = Math.max(minLength - str.length, 0)
  return `${range(missingChars)
    .map(() => `0`)
    .join('')}${str}`
}
