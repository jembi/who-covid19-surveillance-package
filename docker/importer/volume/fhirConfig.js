'use strict'

const fs = require('fs')
const https = require('https')
const http = require('http')
const path = require('path')
const { spawn } = require('child_process')

const resourcesPath = path.resolve(__dirname, 'fhirResources')
const HAPI_FHIR_PATH = process.env.HAPI_FHIR_PATH || '/fhir'
const HAPI_FHIR_HOSTNAME = process.env.HAPI_FHIR_HOSTNAME || 'hapi-fhir'
const HAPI_FHIR_PORT = process.env.HAPI_FHIR_PORT || 8080

const downloadResources = (cb) => {
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
      unzip.stderr.on('data', cb)

      unzip.on('close', () => {
        const allFiles = fs.readdirSync(resourcesPath) || []
        return cb(null, allFiles.filter(file => file.endsWith('.json')))
      })
    })
  }).on('error', cb)
}

const postToFHIRServer = (file) => new Promise((resolve, reject) => {
  const resourceName = file.split(/\-/)[0]
  const data = fs.readFileSync(path.resolve(resourcesPath, file))

  const options = {
    protocol: process.env.COVID19_IG_PROTOCOL || 'http:',
    host: HAPI_FHIR_HOSTNAME,
    port: HAPI_FHIR_PORT,
    path: `${HAPI_FHIR_PATH}/${resourceName}/${JSON.parse(data).id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    }
  }

  const req = http.request(options, (res) => {
    if (res.statusCode !== 201) {
      let responseData = ''
      res.on('data', (chunk) => {
        responseData += chunk.toString()
      })

      res.on('end', () => {
        if (responseData) {
          reject(new Error(`${resourceName} resource creation failed: ${responseData}`))
        }
      })

      res.on('error', reject)
    } else {
      resolve(`Successfully created ${resourceName} resource`)
    }
  })

  req.on('error', (error) => {
    reject(new Error(`Failed to add resource:  ${error}`))
  })

  req.write(data)
  req.end()
})

const findMatch = ({file, resourceTypes}) => {
  const regex = new RegExp(resourceTypes.join("|"), "g")
  const match = file.match(regex)
  return match ? match[0] : null
}

const buildResourceCollectionsObject = ({files, resourceTypes}) => {
  const result = Object.create({ 'Other': [] })
  resourceTypes.forEach(resourceType => {
    result[resourceType] = []
  })

  files.forEach((file) => {
    const match = findMatch({ file, resourceTypes })
    result[match || 'Other'].push(file)
  })

  return result
}

downloadResources(async (err, files) => {
  if (err) {
    console.error(err)
  } else {
    const resourceCollections = buildResourceCollectionsObject({
      files,
      resourceTypes: [
        'CodeSystem',
        'ConceptMap',
        'ValueSet',
        'ImplementationGuide'
      ]
    })

    try {
      await sendResources(
        resourceCollections.Other.concat(
          resourceCollections.ValueSet,
          resourceCollections.CodeSystem,
          resourceCollections.ConceptMap
        )
      )
      console.log('Posting of Resources resources to Hapi FHIR successfully done')
    } catch (err) {
      console.log(err)
    }
  }
})

async function sendResources (resources) {
  if (!resources.length) return
  await postToFHIRServer(resources.pop())
  await sendResources(resources)
}