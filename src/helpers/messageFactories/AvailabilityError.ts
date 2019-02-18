// tslint:disable no-expression-statement
import { Messages } from '../../proto'

export const makeAvailabilityErrorMessage = ({
  name,
  message,
}: {
  readonly name: string
  readonly message: string
}): Messages.AvailabilityError => {
  const error = new Messages.AvailabilityError()
  error.setMessage(message)
  error.setName(name)
  return error
}
