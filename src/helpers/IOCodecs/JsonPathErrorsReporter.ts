// tslint:disable no-submodule-imports
import * as t from 'io-ts'
import { Reporter } from 'io-ts/lib/Reporter'
import { last } from 'lodash'

/**
 * An error message related to a point of
 * a validated data structure.
 * That point is specified as a JSON path.
 */
export interface JsonPathError {
  readonly jsonPath: string
  readonly message: string
}

/**
 * An error reporter to parse a `io-ts` validation errors object
 * into a collection of `JsonPathError` objects
 */
export const JsonPathErrorsReporter: Reporter<
  // tslint:disable-next-line:readonly-array
  JsonPathError[] | undefined
> = {
  report: validation =>
    validation.fold(
      errors =>
        errors.map(error => {
          const lastContext = last(error.context)
          const typeName = lastContext && lastContext.type.name
          return {
            jsonPath: getContextJsonPath(error.context),
            message: `${typeName ? `type ${typeName}: ` : ''}${error.message ||
              'is mandatory'}`,
          }
        }),
      () => undefined
    ),
}

const getContextJsonPath = (context: t.Context): string =>
  `${context
    .map(({ key }, idx) =>
      idx === 0 ? '$' : /^\d+$/.test(key) ? `[${key}]` : `.${key}`
    )
    .join('')}`
