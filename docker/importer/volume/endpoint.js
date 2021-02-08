'use strict'

const fs = require('fs')
const http = require('http')
const path = require('path')

const MEDIATOR_HOSTNAME =
  process.env.MEDIATOR_HOST_NAME || 'covid19-surveillance-mediator'
const MEDIATOR_API_PORT = process.env.MEDIATOR_API_PORT || 3003

const ENDPOINT_FILES = [
  'endpoint-handler.json',
  'endpoint-flattener.json',
  'endpoint-resource-resolver.json',
  'endpoint-location.json',
  'endpoint-bundler.json',
  'endpoint-composition.json',
  'endpoint-encounter.json',
  'endpoint-observation.json'
]

ENDPOINT_FILES.forEach(file => {
  const data = fs.readFileSync(path.resolve(__dirname, file))

  const options = {
    protocol: 'http:',
    host: MEDIATOR_HOSTNAME,
    port: MEDIATOR_API_PORT,
    path: '/endpoints',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const req = http.request(options, (res) => {
    if (res.statusCode === 400) {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk.toString()
      })

      res.on('end', () => {
        if (data) {
          data = JSON.parse(data)
          if (data.error && data.error.match(/duplicate key error/).length) {
            console.log('covid19-surveillance endpoint already exists')
            return
          }
          throw Error('covid19-surveillance endpoint creation failed')
        }
      })

      res.on('error', (err) => {
        throw Error(err)
      })
      return
    }

    if (res.statusCode != 201) {
      throw Error(
        `Failed to create covid19-surveillance mediator endpoint: ${res.statusCode}`
      )
    } else {
      console.log('Successfully created covid19-surveillance endpoint')
    }
  })

  req.on('error', (error) => {
    console.error(
      'Failed to create covid19-surveillance mediator endpoint: ',
      error
    )
  })

  req.write(data)
  req.end()
})
