// tslint:disable no-expression-statement
import { Messages } from '../../proto'

import { JsonPathError } from '../IOCodecs/JsonPathErrorsReporter'

export const makeInputValidationErrorMessage = (
  jsonPathErrors: ReadonlyArray<JsonPathError> | undefined
): Messages.InputValidationError => {
  const error = new Messages.InputValidationError()
  // tslint:disable-next-line:no-if-statement
  if (jsonPathErrors) {
    error.setErrorsList(
      jsonPathErrors.map(({ jsonPath, message }) => {
        const e = new Messages.JsonPathError()
        e.setJsonpath(jsonPath)
        e.setMessage(message)
        return e
      })
    )
  }
  return error
}
