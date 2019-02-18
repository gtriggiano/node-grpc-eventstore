// tslint:disable no-expression-statement
import { Messages } from '../../proto'

export const makeOverlappingInsertionsErrorMessage = (
  // tslint:disable-next-line:readonly-array
  indexes: number[]
): Messages.OverlappingInsertionsError => {
  const error = new Messages.OverlappingInsertionsError()
  error.setIndexesList(indexes)
  return error
}
