import * as t from 'io-ts'
import { isString } from 'lodash'

const regex = /^[a-zA-Z][a-zA-Z0-9_-]*$/

const is = (u: unknown): u is StreamTypeNameOrContext =>
  isString(u) && regex.test(u)

export type StreamTypeNameOrContext = string

export const StreamTypeNameOrContext = new t.Type<StreamTypeNameOrContext>(
  'StreamTypeNameOrContext',
  is,
  (u, c) =>
    is(u)
      ? t.success(u)
      : t.failure(
          u,
          c,
          'should be a string matching /^[a-zA-Z][a-zA-Z0-9_-]*$/'
        ),
  t.identity
)
