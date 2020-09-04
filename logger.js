// A logger is an object that:
// Has scoped properties that are sent on every log message,
// Is configured with:
//   a 'now' function that returns a ISO datetime stamp string
//   a 'service' name
//   an 'output' function, that is typically console.log
// and exposes the following methods:
//   .debug
//   .info
//   .warning
//   .error
//   .critical
//   Each of which takes a single object and then logs to STDOUT
//   a JSON representation of the object on a single line.
// It also exposes a .with method that is a fluent interface that
// takes more properties and returns another logger that incorporates
// those properties.

const assert = require('assert')
const jsonHelper = require('./json-helper')
const ECS_VERSION = '1.5.0'

const Logger = (serviceName,
                defaultProperties = {},
                now = null,
                output = console) => {
  assert.equal(typeof(serviceName), 'string',
               'configuration must have a service name')
  if (typeof(now) != 'function') { now = () => (new Date()).toISOString() }
  if (typeof(output) != 'object' || typeof(output.log) != 'function') {
    output = console
  }

  const isValidString = (message) => message.trim().length > 0

  const log = (severity, message, err) => {
    if (typeof(message) === 'string') {
      assert(isValidString(message),
             'There must be a non-empty message')
      message = { message: message }
    } else if (typeof(message) === 'object') {
      assert(message.hasOwnProperty('message'),
             'Log object must have a message property')
      assert(isValidString(message.message),
             'The message property of log object must not be empty')
    } else {
      throw new Error('Message must be either an object or a string')
    }

    var errorMessage = {}
    if (err) {
      errorMessage = { error: { message: err.message,
                                type: err.name,
                                stack_trace: err.stack.split('\n') }}}
    const totalMessage = { ...{ ecs: { version: ECS_VERSION },
                                log: { level: severity },
                                '@timestamp': now(),
                                service: { name: serviceName }},
                           ...defaultProperties,
                           ...errorMessage,
                           ...message }
    const nestedMessage = jsonHelper(totalMessage)
    output.log(JSON.stringify(nestedMessage))
  }

  return {
    ECS_VERSION: ECS_VERSION,
    now: now,
    output: output,
    serviceName: serviceName,
    defaultProperties: defaultProperties,
    debug: log.bind(null, 'debug'),
    info: log.bind(null, 'info'),
    warning: log.bind(null, 'warning'),
    warn: log.bind(null, 'warning'),
    error: log.bind(null, 'error'),
    critical: log.bind(null, 'critical'),
    with: (moreProperties) => {
      return Logger(serviceName,
                    {...defaultProperties,
                     ...moreProperties},
                    now,
                    output)
    } // end .with
  } // end return
} // end Logger

module.exports = Logger
