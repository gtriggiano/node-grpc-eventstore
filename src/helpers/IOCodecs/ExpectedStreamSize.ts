import * as t from 'io-ts'
import { isInteger, isNumber } from 'lodash'

const is = (u: unknown): u is ExpectedStreamSize =>
  isNumber(u) && isInteger(u) && u >= -2

export type ExpectedStreamSize = number

export const ExpectedStreamSize = new t.Type<ExpectedStreamSize>(
  'ExpectedStreamSize',
  is,
  (u, c) =>
    is(u) ? t.success(u) : t.failure(u, c, 'should be an integer >= -2'),
  t.identity
)
