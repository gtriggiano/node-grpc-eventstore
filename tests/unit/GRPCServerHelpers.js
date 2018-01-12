/* global describe it */
import path from 'path'
import should from 'should/as-function'
import uuid from 'uuid'

const codeFolder = path.resolve(__dirname, '..', '..', process.env.CODE_FOLDER)
const { default: DbResultsStream } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'DbResultsStream',
))
const { default: isANotEmptyString } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'isANotEmptyString',
))
const { default: isValidStream } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'isValidStream',
))
const { default: isValidStreamType } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'isValidStreamType',
))
const { default: sanitizeStream } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'sanitizeStream',
))
const { default: sanitizeStreamType } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'sanitizeStreamType',
))
const { default: streamToString } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'streamToString',
))
const { default: validateAppendRequest } = require(path.resolve(
  codeFolder,
  'GRPCServer',
  'helpers',
  'validateAppendRequest',
))

describe('lib/GRPCServer/helpers/DbResultsStream', () => {
  it('is a function', () => {
    should(DbResultsStream).be.a.Function()
  })
})
describe('lib/GRPCServer/helpers/isANotEmptyString(value)', () => {
  it('is a function', () => {
    should(isANotEmptyString).be.a.Function()
  })
  it('return false if `value` is not a string', () => {
    should(isANotEmptyString(0)).be.False()
    should(isANotEmptyString([])).be.False()
    should(isANotEmptyString({})).be.False()
    should(isANotEmptyString(NaN)).be.False()
    should(isANotEmptyString(function () {})).be.False()
    should(isANotEmptyString(new Date())).be.False()
  })
  it('return false if `value` is a string of length === 0', () => {
    should(isANotEmptyString('')).be.False()
  })
  it('return false if `value` is a string containing only spaces', () => {
    should(isANotEmptyString('     ')).be.False()
  })
  it('return true if `value` is a string containing at least one character which is not a space', () => {
    should(isANotEmptyString('   d  ')).be.True()
  })
})
describe('lib/GRPCServer/helpers/isValidStream(stream)', () => {
  it('is a function', () => {
    should(isValidStream).be.a.Function()
  })
  it('return false if `stream` is not an object', () => {
    should(isValidStream(10)).be.False()
    should(isValidStream('')).be.False()
    should(isValidStream('aaa')).be.False()
    should(isValidStream(NaN)).be.False()
  })
  it('return false if !isValidStreamType(stream.type) || !isString(stream.id)', () => {
    should(
      isValidStream({
        id: uuid(),
      }),
    ).be.False()
    should(
      isValidStream({
        type: {
          context: uuid(),
          name: uuid(),
        },
      }),
    ).be.False()
    should(
      isValidStream({
        id: uuid(),
        type: {
          context: uuid(),
        },
      }),
    ).be.False()
    should(
      isValidStream({
        id: uuid(),
        type: {
          context: uuid(),
          name: '   ',
        },
      }),
    ).be.False()
  })
  it('return true if isValidStreamType(stream.type) && isString(stream.id)', () => {
    should(
      isValidStream({
        id: uuid(),
        type: {
          context: uuid(),
          name: uuid(),
        },
      }),
    ).be.True()
  })
})
describe('lib/GRPCServer/helpers/isValidStreamType(streamType)', () => {
  it('is a function', () => {
    should(isValidStreamType).be.a.Function()
  })
  it('return false if `streamType` is not an object', () => {
    should(isValidStreamType(10)).be.False()
    should(isValidStreamType('')).be.False()
    should(isValidStreamType('aaa')).be.False()
    should(isValidStreamType(NaN)).be.False()
  })
  it('return false if !isString(streamType.context) || !isANotEmptyString(streamType.name)', () => {
    should(
      isValidStreamType({
        name: uuid(),
      }),
    ).be.False()
    should(
      isValidStreamType({
        context: 10,
        name: uuid(),
      }),
    ).be.False()
    should(
      isValidStreamType({
        context: uuid(),
        name: 10,
      }),
    ).be.False()
    should(
      isValidStreamType({
        context: uuid(),
        name: '',
      }),
    ).be.False()
    should(
      isValidStreamType({
        context: uuid(),
        name: '    ',
      }),
    ).be.False()
  })
  it('return true if isString(streamType.context) && isANotEmptyString(streamType.name)', () => {
    should(
      isValidStreamType({
        context: uuid(),
        name: uuid(),
      }),
    ).be.True()
    should(
      isValidStreamType({
        context: '',
        name: uuid(),
      }),
    ).be.True()
    should(
      isValidStreamType({
        context: '',
        name: '   s ',
      }),
    ).be.True()
  })
})
describe('lib/GRPCServer/helpers/sanitizeStream(stream)', () => {
  it('is a function', () => {
    should(sanitizeStream).be.a.Function()
  })
  it('return a new `stream` object where stream.id got trimmed', () => {
    let stream = {
      id: '    a ',
      type: {
        context: uuid(),
        name: uuid(),
      },
    }
    let sanitizedStream = sanitizeStream(stream)
    should(sanitizedStream).not.equal(stream)
    should(sanitizedStream.id).equal('a')
  })
  it('return a new `stream` object where stream.type has been sanitized', () => {
    let stream = {
      id: '',
      type: {
        context: '    b    ',
        name: '   c   ',
      },
    }
    let sanitizedStream = sanitizeStream(stream)
    should(sanitizedStream).not.equal(stream)
    should(sanitizedStream.type.context).equal('b')
    should(sanitizedStream.type.name).equal('c')
  })
})
describe('lib/GRPCServer/helpers/sanitizeStreamType(streamType)', () => {
  it('is a function', () => {
    should(sanitizeStreamType).be.a.Function()
  })
  it('return a new `streamType` object where streamType.context and streamType.name have been trimmed', () => {
    let streamType = {
      context: '    a   ',
      name: '    b   ',
    }
    let sanitizedStreamType = sanitizeStreamType(streamType)
    should(sanitizedStreamType).not.equal(streamType)
    should(sanitizedStreamType.context).equal('a')
    should(sanitizedStreamType.name).equal('b')
  })
})
describe('lib/GRPCServer/helpers/streamToString(stream)', () => {
  it('is a function', () => {
    should(streamToString).be.a.Function()
  })
  it('return a string -> `${stream.type.context}:${stream.type.name}:${stream.id}`', () => {
    // eslint-disable-line no-template-curly-in-string
    let stream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }
    should(streamToString(stream)).equal(
      `${stream.type.context}:${stream.type.name}:${stream.id}`,
    )
  })
})
describe('lib/GRPCServer/helpers/validateAppendRequest(appendRequest, isStreamWritable)', () => {
  it('is a function', () => {
    should(validateAppendRequest).be.a.Function()
  })
  it('throws `stream is not valid...` if !isValidStream(appendRequest.stream)', () => {
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: '    ',
            },
          },
        },
        () => true,
      )
    }).throw(new RegExp('^stream is not valid'))
  })
  it('throws `expectedSequenceNumber should be >= -2...` if appendRequest.expectedSequenceNumber < -2', () => {
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          expectedSequenceNumber: -3,
        },
        () => true,
      )
    }).throw(new RegExp('^expectedSequenceNumber should be >= -2'))
  })
  it('throws `events should be a list of one or more events` if appendRequest.events is falsy or an empty array', () => {
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          expectedSequenceNumber: -2,
        },
        () => true,
      )
    }).throw('events should be a list of one or more events')
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          expectedSequenceNumber: -2,
          events: [],
        },
        () => true,
      )
    }).throw('events should be a list of one or more events')
  })
  it('throws `all events should have a type which should be a non empty string` if some appendRequest.events has a type which !isANotEmptyString()', () => {
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          expectedSequenceNumber: -2,
          events: [
            {
              type: '',
              data: '',
            },
            {
              type: uuid(),
              data: uuid(),
            },
          ],
        },
        () => true,
      )
    }).throw('all events should have a type which should be a non empty string')
    should(() => {
      validateAppendRequest(
        {
          stream: {
            id: uuid(),
            type: {
              context: uuid(),
              name: uuid(),
            },
          },
          expectedSequenceNumber: -2,
          events: [
            {
              type: '   ',
              data: '',
            },
            {
              type: uuid(),
              data: uuid(),
            },
          ],
        },
        () => true,
      )
    }).throw('all events should have a type which should be a non empty string')
  })
  it('throws `NOT_WRITABLE_STREAM|JSON.stringify(appendRequest.stream)` if !isStreamWritable(stream)', () => {
    let stream = {
      id: uuid(),
      type: {
        context: uuid(),
        name: uuid(),
      },
    }

    should(() => {
      validateAppendRequest(
        {
          stream: stream,
          expectedSequenceNumber: -2,
          events: [
            {
              type: uuid(),
              data: uuid(),
            },
          ],
        },
        () => false,
      )
    }).throw(`NOT_WRITABLE_STREAM|${JSON.stringify(stream)}`)
  })
})
