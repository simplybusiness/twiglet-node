# Twiglet: Node.js version

Like a log, only smaller.

This library provides a minimal JSON logging interface suitable for use in (micro)services. See the [RATIONALE](RATIONALE.md) for design rationale and an explantion of the Elastic Common Schema that we are using for log attribute naming.

![Node.js CI](https://github.com/simplybusiness/twiglet-node/workflows/Node.js%20CI/badge.svg?branch=master)

## Installation

```bash
npm install --save @simplybusiness/twiglet
```

## How to use

Create a new logger like so:

```javascript
const Logger = require('@simplybusiness/twiglet')
const log = Logger('service-name')
```

The logger may be passed in the configuration object an optional output attribute which should be an object with a 'log' method - like `console`. The configuration object may also have an optional now atttribute, which should be a function that returns an ISO 8601 compliant datetimestamp. The defaults should serve for most uses, though you may want to override them for testing as we have done [here](./spec/logger-spec.js).

To use, simply invoke like most other loggers:

```javascript
log.error({ event: { action: 'startup' }, message: "Emergency! There's an Emergency going on" })
```

This will write to STDOUT a JSON string:

```json
{"@timestamp":"2020-05-07T09:06:52.409Z","service":{"name":"petshop"},"event":{"action":"startup"},"log":{"level":"error"},"message":"Emergency! There's an Emergency going on"}
```

Obviously the timestamp will be different.

Add log event specific information simply as attributes in a POJO (Plain Old Javascript Object):

```javascript
log.info({
  event: { action: 'HTTP request' },
  message: 'GET /pets success',
  trace: { id: '1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb' },
  http: {
    request: { method: 'get' },
    response: { status_code: 200 }
  },
  url: { path: '/pets' }
})
```

This writes:

```json
{"service":{"name":"petstore"},"@timestamp":"2020-05-07T09:06:52.409Z","event":{"action":"HTTP request"},"log":{"level":"info"},"trace":{"id":"1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb"},"http":{"request":{"method":"get"},"response":{status_code:200}},"url.path":"/pets"}
```

It may be that when making a series of logs that write information about a single event, you may want to avoid duplication by creating an event specific logger that includes the context:

```javascript
const requestLog = log.with({ event: { action: 'HTTP request'}, trace: { id: '1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb' }})
```

This can be used like any other Logger instance:

```javascript
requestLog.error({
    message: 'Error 500 in /pets/buy',
    http: {
        request: { method: 'post', 'url.path': '/pet/buy' },
        response: { status_code: 500 }
    }
})
```

which will print:

```json
{"service":{"name":"petstore"},"@timestamp":"2020-05-07T09:06:52.409Z","event":{"action":"HTTP request"},"log":{"level":"error"},"trace":{"id":"1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb"},"http":{"request":{"method":"post","url.path":"/pet/buy"},"response":{"status_code":500}},"message":"Error 500 in /pets/buy"}
```

## Logging of [Error objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

```javascript
try {
  throw new Error("Oh noes!")
} catch(err) {
  requestLog.error({ message: 'Failed during customer login' }, err)
}
```

which will print (prettified):

```json
{
  "ecs": {
    "version": "1.5.0"
  },
  "log": {
    "level": "error"
  },
  ...
  "error": {
    "message": "Oh noes!",
    "type": "Error",
    "stack_trace": [
      "Error: Oh noes!",
      "    at Object.<anonymous> (/home/twiglet-node/example-app.js:28:9)",
      "    at Module._compile (internal/modules/cjs/loader.js:1076:30)",
      "    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1097:10)",
      "    at Module.load (internal/modules/cjs/loader.js:941:32)",
      "    at Function.Module._load (internal/modules/cjs/loader.js:782:14)",
      "    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12)",
      "    at internal/main/run_main_module.js:17:47"
    ]
  },
  "message": "Failed during customer login"
}
```

## Use of dotted keys

Writing nested json objects could be confusing. This library has a built-in feature to convert dotted keys into nested objects, so if you log like this:

```javascript
log.info({ 
    'event.action': 'HTTP request',
    message: 'GET /pets success',
    'trace.id': '1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb',
    'http.request.method': 'get',
    'http.response.status_code': 200,
    'url.path': '/pets'
})
```

or mix between dotted keys and nested objects:

```javascript
log.info({
    'event.action': 'HTTP request',
    message: 'GET /pets success',
    trace: { id: '1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb' },
    'http.request.method': 'get',
    'http.response.status_code': 200,
    url: { path: '/pets' }
})
```

Both cases would print out exact the same log item:

```json
{"service":{"name":"petstore"},"@timestamp":"2020-05-07T09:06:52.409Z","event":{"action":"HTTP request"},"log":{"level":"info"},"trace":{"id":"1c8a5fb2-fecd-44d8-92a4-449eb2ce4dcb"},"http":{"request":{"method":"get","url.path":"/pets"},"response":{status_code:200}}}
```

## How to contribute

First: Please read our project [Code of Conduct](CODE_OF_CONDUCT.md).

Second: run the tests and make sure your changes don't break anything:

```bash
npm test
```

Then please feel free to submit a PR.
