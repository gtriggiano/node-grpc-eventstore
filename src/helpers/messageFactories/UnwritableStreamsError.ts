// tslint:disable no-expression-statement
import { Messages } from '../../proto'
import { Stream } from '../../types'

import { makeStreamMessage } from './Stream'

export const makeUnwritableStreamsErrorMessage = (
  streams: ReadonlyArray<Stream>
): Messages.UnwritableStreamsError => {
  const error = new Messages.UnwritableStreamsError()
  error.setStreamsList(streams.map(makeStreamMessage))
  return error
}
