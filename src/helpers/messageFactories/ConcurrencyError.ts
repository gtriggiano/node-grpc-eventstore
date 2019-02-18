// tslint:disable no-expression-statement
import { Messages } from '../../proto'
import { InsertionConcurrencyFailure } from '../../types'

import { makeStreamMessage } from './Stream'

export const makeConcurrencyErrorMessage = (
  concurrencyFailures: ReadonlyArray<InsertionConcurrencyFailure>
): Messages.ConcurrencyError => {
  const error = new Messages.ConcurrencyError()
  error.setConcurrencyIssuesList(
    concurrencyFailures.map(
      ({ currentStreamSize, expectedStreamSize, stream, type }) => {
        const failure = new Messages.ConcurrencyIssue()
        failure.setCurrentStreamSize(currentStreamSize)
        failure.setExpectedStreamSize(expectedStreamSize)
        failure.setStream(makeStreamMessage(stream))
        failure.setType(type)
        return failure
      }
    )
  )
  return error
}
