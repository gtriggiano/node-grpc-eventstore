// tslint:disable no-expression-statement
import { StoredEvent, Stream, StreamType } from '../proto'
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
}: DbStoredEvent): StoredEvent => {
  const streamTypeMessage = new StreamType()
  streamTypeMessage.setName(stream.type.name)
  streamTypeMessage.setContext(stream.type.context)

  const streamMessage = new Stream()
  streamMessage.setId(stream.id)
  streamMessage.setType(streamTypeMessage)

  const message = new StoredEvent()
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
