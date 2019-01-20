import assert from 'assert'
import { isFunction, isInteger, isObject } from 'lodash'

export const validateNodeConfiguration = (configuration: any): void => {
  assert(isObject(configuration), '`configuration` must be an object')

  const {
    port,
    credentials,
    dbAdapter,
    isStreamWritable,
    storeBus,
  } = configuration

  assert(
    isInteger(port) && port >= 1 && port <= 65535,
    `configuration.port must be valid port number`
  )
  assert(
    areValidGRPCCredentials(credentials),
    `configuration.credentials must be valid GRPC credentials`
  )
  assert(
    isValidDbAdapter(dbAdapter),
    `configuration.dbAdapter must have a valid interface`
  )
  assert(
    isFunction(isStreamWritable),
    `configuration.isStreamWritable must be a function`
  )
  assert(
    isValidStoreBus(storeBus),
    `configuration.storeBus must have a valid interface`
  )
}

const areValidGRPCCredentials = (credentials: any): boolean =>
  isObject(credentials) &&
  isFunction(credentials.toString) &&
  credentials.toString() === '[object ServerCredentials]'

const isValidDbAdapter = (dbAdapter: any): boolean =>
  isObject(dbAdapter) &&
  isFunction(dbAdapter.appendEvents) &&
  isFunction(dbAdapter.getEvents) &&
  isFunction(dbAdapter.getEventsByStream) &&
  isFunction(dbAdapter.getEventsByStreamType)

const isValidStoreBus = (storeBus: any): boolean =>
  isObject(storeBus) && isFunction(storeBus.on) && isFunction(storeBus.publish)
