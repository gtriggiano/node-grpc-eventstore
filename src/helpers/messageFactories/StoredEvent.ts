// tslint:disable no-expression-statement
import { Messages } from '../../proto'
import { StoredEvent } from '../../types'

import { makeStreamMessage } from './Stream'

export const makeStoredEventMessage = ({
  id,
  stream,
  name,
  payload,
  storedOn,
  sequenceNumber,
  correlationId,
  transactionId,
}: StoredEvent): Messages.StoredEvent => {
  const message = new Messages.StoredEvent()
  message.setId(id)
  message.setStream(makeStreamMessage(stream))
  message.setName(name)
  message.setPayload(payload)
  message.setStoredOn(storedOn)
  message.setSequenceNumber(sequenceNumber)
  message.setCorrelationId(correlationId)
  message.setTransactionId(transactionId)
  return message
}
