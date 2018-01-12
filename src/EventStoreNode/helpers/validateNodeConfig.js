import assert from 'assert'
import { isInteger, isObject, isFunction } from 'lodash'

export default function validateNodeConfig (config) {
  assert(
    isInteger(config.port) && config.port >= 1 && config.port <= 65535,
    `config.port must be valid port number`,
  )
  assert(
    areValidGRPCCredentials(config.credentials),
    `config.credentials must be valid GRPC credentials`,
  )
  assert(
    hasDbAdapterInterface(config.dbAdapter),
    `config.dbAdapter must have a valid interface`,
  )
  assert(
    isFunction(config.isStreamWritable),
    `config.isStreamWritable must be a function`,
  )
  assert(
    hasStoreBusInterface(config.storeBus),
    `config.storeBus must have a valid interface`,
  )
}

function areValidGRPCCredentials (credentials) {
  return (
    isObject(credentials) &&
    isFunction(credentials.toString) &&
    credentials.toString() === '[object ServerCredentials]'
  )
}
function hasDbAdapterInterface (dbAdapter) {
  return (
    isObject(dbAdapter) &&
    isFunction(dbAdapter.appendEvents) &&
    isFunction(dbAdapter.getEvents) &&
    isFunction(dbAdapter.getEventsByStream) &&
    isFunction(dbAdapter.getEventsByStreamType)
  )
}
function hasStoreBusInterface (storeBus) {
  return (
    isObject(storeBus) &&
    isFunction(storeBus.on) &&
    isFunction(storeBus.publish)
  )
}
