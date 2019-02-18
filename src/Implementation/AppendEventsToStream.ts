// tslint:disable no-expression-statement no-if-statement
import uuid from 'uuid'

import { Insertion as InsertionCodec } from '../helpers/IOCodecs/Insertion'
import { JsonPathErrorsReporter } from '../helpers/IOCodecs/JsonPathErrorsReporter'
import {
  makeAvailabilityErrorMessage,
  makeConcurrencyErrorMessage,
  makeInputValidationErrorMessage,
  makeStoredEventMessage,
  makeUnwritableStreamsErrorMessage,
} from '../helpers/messageFactories'
import { IEventStoreServer, Messages } from '../proto'
import { AppendOperationError, StoredEvent } from '../types'

import { ImplementationConfiguration } from './index'

export const ANY_SEQUENCE_NUMBER = -2
export const ANY_POSITIVE_SEQUENCE_NUMBER = -1

type AppendEventsToStreamFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['appendEventsToStream']

export const AppendEventsToStream: AppendEventsToStreamFactory = ({
  persistency,
  onEventsStored,
  isStreamWritable,
}) => (call, callback) => {
  const result = new Messages.AppendOperationResult()

  const correlationId = call.request.getCorrelationId()
  const insertionMessage = call.request.getInsertion()

  // Input validation
  const inputValidation = InsertionCodec.decode(
    insertionMessage && insertionMessage.toObject()
  )
  if (inputValidation.isLeft()) {
    const appendOperationError = new Messages.AppendOperationError()
    appendOperationError.setInputValidationError(
      makeInputValidationErrorMessage(
        JsonPathErrorsReporter.report(inputValidation)
      )
    )
    result.setError(appendOperationError)
    return callback(null, result)
  }

  const insertion = inputValidation.value

  // Permission to write check
  if (
    insertion.eventsList.length &&
    !isStreamWritable(insertion.stream, call.metadata)
  ) {
    const appendOperationError = new Messages.AppendOperationError()
    appendOperationError.setUnwritableStreamsError(
      makeUnwritableStreamsErrorMessage([insertion.stream])
    )
    result.setError(appendOperationError)
    return callback(null, result)
  }

  const onPersistenceSuccess = (storedEvents: ReadonlyArray<StoredEvent>) => {
    const storedEventsListMessage = new Messages.StoredEventsList()
    storedEventsListMessage.setStoredEventsList(
      storedEvents.map(makeStoredEventMessage)
    )
    result.setSuccess(storedEventsListMessage)

    onEventsStored(storedEvents)
    callback(null, result)
  }

  const onPersistenceFailure = (error: AppendOperationError) => {
    const appendOperationError = new Messages.AppendOperationError()
    result.setError(appendOperationError)

    switch (error.type) {
      case 'AVAILABILITY':
        appendOperationError.setAvailabilityError(
          makeAvailabilityErrorMessage(error)
        )
        return callback(null, result)

      case 'CONCURRENCY':
        appendOperationError.setConcurrencyError(
          makeConcurrencyErrorMessage(error.failures)
        )
        return callback(null, result)
    }
  }

  const insertionEmitter = persistency.appendInsertions(
    [insertion],
    uuid(),
    correlationId
  )
  const cleanListeners = () => insertionEmitter.removeAllListeners()

  insertionEmitter.on('stored-events', storedEvents => {
    cleanListeners()
    onPersistenceSuccess(storedEvents)
  })
  insertionEmitter.on('error', error => {
    cleanListeners()
    onPersistenceFailure(error)
  })
}
