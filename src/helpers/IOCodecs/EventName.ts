import * as t from 'io-ts'
import { isString } from 'lodash'

const regex = /^(?! )[A-Za-z0-9;:._-]*(?<! )$/

const is = (u: unknown): u is EventName => isString(u) && regex.test(u)

export type EventName = string

export const EventName = new t.Type<EventName>(
  'EventName',
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
