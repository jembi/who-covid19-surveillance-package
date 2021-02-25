'use strict'

const fs = require('fs')
const https = require('https')
const http = require('http')
const path = require('path')
const { spawn } = require('child_process')

const resourcesPath = path.resolve(__dirname, 'fhirResources')

const downloadResources = (cbk) => {
  const COVID19_IG_URL = process.env.COVID19_IG_URL || 'https://openhie.github.io/covid-ig'
  
  if (fs.existsSync(resourcesPath))
    fs.rmdirSync(resourcesPath, { recursive: true })
  
  fs.mkdirSync(resourcesPath)
  
  const resources = fs.createWriteStream(path.resolve(resourcesPath, 'fhir-resources.zip'))

  https.get(`${COVID19_IG_URL}/definitions.json.zip`, (response) => {
    response.pipe(resources)
    resources.on('finish', () => {
      resources.close()

      const unzip = spawn('unzip', [path.resolve(resourcesPath, 'fhir-resources.zip'), '-d', resourcesPath])
      unzip.stderr.on('data', cbk)

      unzip.on('close', () => {
        const allFiles = fs.readdirSync(resourcesPath) || []
        return cbk(null, allFiles.filter(file => file.endsWith('.json')))
      })
    })
  }).on('error', cbk)
}

const postToFHIRServer = (files) => {
  const HAPI_FHIR_PATH =
    process.env.HAPI_FHIR_PATH || '/fhir'
  const HAPI_FHIR_HOSTNAME = process.env.HAPI_FHIR_HOSTNAME || 'hapi-fhir'
  const HAPI_FHIR_PORT = process.env.HAPI_FHIR_PORT || 3447

  files.forEach(file => {
    const resourceName = file.split(/\-/)[0]
    const data = fs.readFileSync(path.resolve(resourcesPath, file))
  
    const options = {
      protocol: process.env.COVID19_IG_PROTOCOL || 'http:',
      host: HAPI_FHIR_HOSTNAME,
      port: HAPI_FHIR_PORT,
      path: `${HAPI_FHIR_PATH}/${resourceName}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    }
  
    const req = http.request(options, (res) => {
      if (res.statusCode === 400) {
        let responseData = ''
        res.on('data', (chunk) => {
          responseData += chunk.toString()
        })
  
        res.on('end', () => {
          if (responseData) {
            throw Error(`${resourceName} resource creation failed: ${responseData}`)
          }
        })
  
        res.on('error', (err) => {
          throw Error(err)
        })
        return
      }
  
      if (res.statusCode != 201) {
        throw Error(
          `Failed to create ${resourceName} resource: ${res.statusCode}`
        )
      } else {
        console.log(`Successfully created ${resourceName} resource`)
      }
    })
  
    req.on('error', (error) => {
      console.error('Failed to add resource: ', error)
    })
  
    req.write(data)
    req.end()
  })
}

downloadResources((err, files) => {
  if (err) {
    console.error(err)
  } else {
    postToFHIRServer(files)
  }
})