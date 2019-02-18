// tslint:disable no-expression-statement
import { Messages } from '../../proto'
import { Stream } from '../../types'

export const makeStreamMessage = ({ id, type }: Stream): Messages.Stream => {
  const streamType = new Messages.StreamType()
  streamType.setContext(type.context)
  streamType.setName(type.name)

  const message = new Messages.Stream()
  message.setId(id)
  message.setType(streamType)

  return message
}
