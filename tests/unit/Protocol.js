/* global describe it */

import fs from 'fs'
import path from 'path'
import should from 'should/as-function'

const codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
const { PROTOCOL_FILE_PATH, getProtocol } = require(path.resolve(
  codeFolder,
  'Protocol',
))

describe('lib/Protocol', () => {
  describe('.PROTOCOL_FILE_PATH', () => {
    it('is the absolute path of the library GRPCEventStore.proto file', () => {
      should(PROTOCOL_FILE_PATH).be.a.String()
      should(PROTOCOL_FILE_PATH.substring(0, 1)).equal('/')
      let protocolFileContent = fs
        .readFileSync(
          path.resolve(__dirname, '..', '..', 'GRPCEventStore.proto'),
        )
        .toString()
      let targetFileContent = fs.readFileSync(PROTOCOL_FILE_PATH).toString()
      should(protocolFileContent === targetFileContent).be.True()
    })
  })
  describe('.getProtocol()', () => {
    it('is a function', () => should(getProtocol).be.a.Function())
    it('returns the protocol object of the grpc-eventstore package defined by the GRPCEventStore.proto file', () => {
      let protocol = getProtocol()
      should(protocol.EventStore).be.a.Function()
      should(protocol.EventStore.service).be.an.Object()
    })
  })
})
