// tslint:disable no-expression-statement no-if-statement no-let
import { uniq } from 'lodash'
import uuid from 'uuid'

import { InsertionsList as InsertionsListCodec } from '../helpers/IOCodecs/InsertionsList'
import { JsonPathErrorsReporter } from '../helpers/IOCodecs/JsonPathErrorsReporter'
import {
  makeAvailabilityErrorMessage,
  makeConcurrencyErrorMessage,
  makeInputValidationErrorMessage,
  makeOverlappingInsertionsErrorMessage,
  makeStoredEventMessage,
  makeUnwritableStreamsErrorMessage,
} from '../helpers/messageFactories'
import { IEventStoreServer, Messages } from '../proto'
import {
  AppendOperationError,
  StoredEvent,
  Stream,
  StreamInsertion,
} from '../types'

import { ImplementationConfiguration } from './index'

type AppendEventsToMultipleStreamsFactory = (
  config: ImplementationConfiguration
) => IEventStoreServer['appendEventsToMultipleStreams']

export const AppendEventsToMultipleStreams: AppendEventsToMultipleStreamsFactory = ({
  persistency,
  onEventsStored,
  isStreamWritable,
}) => (call, callback) => {
  const result = new Messages.AppendOperationResult()

  const correlationId = call.request.getCorrelationId()
  const { insertionsList } = call.request.toObject()

  /**
   * Check if at least one insertion was passed
   */
  if (!insertionsList.length) {
    result.setSuccess(new Messages.StoredEventsList())
    return callback(null, result)
  }

  /**
   * Check if the passed insertions contain at least one event
   */
  const totalEventstoPersist = insertionsList.reduce<
    ReadonlyArray<Messages.Event.AsObject>
  >((list, { eventsList }) => list.concat(eventsList), []).length
  if (totalEventstoPersist === 0) {
    result.setSuccess(new Messages.StoredEventsList())
    return callback(null, result)
  }

  /**
   * Validate insertions
   */
  const inputValidation = InsertionsListCodec.decode(insertionsList)
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

  const insertions = inputValidation.value

  /**
   * Check if multiple insertions for the same stream were passed
   */
  const indexesOfOverlappingInsertions = getOverlappingInsertionsIndexes(
    insertions
  )
  if (indexesOfOverlappingInsertions !== undefined) {
    const appendOperationError = new Messages.AppendOperationError()
    appendOperationError.setOverlappingInsertionsError(
      makeOverlappingInsertionsErrorMessage(indexesOfOverlappingInsertions)
    )
    return callback(null, result)
  }

  /**
   * Check if some insertion is related to an unwritable stream
   */
  const unwritableStreams = insertions
    .filter(({ eventsList }) => eventsList.length)
    .map(({ stream }) => stream)
    .filter(stream => !isStreamWritable(stream, call.metadata))
  if (unwritableStreams.length) {
    const appendOperationError = new Messages.AppendOperationError()
    appendOperationError.setUnwritableStreamsError(
      makeUnwritableStreamsErrorMessage(unwritableStreams)
    )
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
    insertions,
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

export const streamToString = (stream: Stream) =>
  `${stream.type.context}|${stream.type.name}${
    stream.id ? `|${stream.id}` : ''
  }`

export const getOverlappingInsertionsIndexes = (
  insertions: ReadonlyArray<StreamInsertion>
) => {
  const namesOfStreams = insertions.map(({ stream }) => streamToString(stream))
  const thereAreOverlappingInsertions =
    namesOfStreams.length !== uniq(namesOfStreams).length
  return thereAreOverlappingInsertions
    ? namesOfStreams
        .map<[number, string]>((name, idx) => [idx, name])
        .filter(([_, name], i) => namesOfStreams.includes(name, i + 1))
        .map(([idx]) => idx)
    : void 0
}
