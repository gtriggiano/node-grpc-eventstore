// tslint:disable no-expression-statement
import { Messages } from '../proto'
import { DbStoredEvent } from '../types'

export const getStoredEventMessage = ({
  id,
  stream,
  name,
  payload,
  storedOn,
  sequenceNumber,
  correlationId,
  transactionId,
}: DbStoredEvent): Messages.StoredEvent => {
  const streamTypeMessage = new Messages.StreamType()
  streamTypeMessage.setName(stream.type.name)
  streamTypeMessage.setContext(stream.type.context)

  const streamMessage = new Messages.Stream()
  streamMessage.setId(stream.id)
  streamMessage.setType(streamTypeMessage)

  const message = new Messages.StoredEvent()
  message.setId((id as unknown) as number)
  message.setStream(streamMessage)
  message.setName(name)
  message.setPayload(payload)
  message.setStoredOn(storedOn)
  message.setSequenceNumber(sequenceNumber)
  message.setCorrelationId(correlationId)
  message.setTransactionId(transactionId)

  return message
}
