'use strict'

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const DHIS2_PROTOCOL = process.env.DHIS2_PROTOCOL || 'http'
const DHIS2_API_HOSTNAME = process.env.DHIS2_API_HOSTNAME || 'dhis-web'
const DHIS2_API_PASSWORD = process.env.DHIS2_API_PASSWORD || 'district'
const DHIS2_API_PORT = process.env.DHIS2_API_PORT || 8080
const DHIS2_API_USERNAME = process.env.DHIS2_API_USERNAME || 'admin'
const DHIS2_METADATA_FILENAME =
  process.env.DHIS2_METADATA_FILENAME || 'metadata.json.gz'

const authHeader = Buffer.from(
  `${DHIS2_API_USERNAME}:${DHIS2_API_PASSWORD}`
).toString('base64')

exports.importMetaData = async () => {
  const fileContents = fs.createReadStream(
    path.resolve(__dirname, DHIS2_METADATA_FILENAME)
  )
  const unzip = zlib.createGunzip()

  function streamToString(stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
  }

  const configData = await streamToString(fileContents.pipe(unzip))

  console.log(
    'Importing DHIS2 data... Byte Length: ',
    Buffer.byteLength(configData)
  )

  const options = {
    url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/metadata`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(configData),
      Authorization: `Basic ${authHeader}`
    },
    maxContentLength: 100000000,
    data: configData
  }

  try {
    const response = await axios(options)

    console.log(
      `Successfully Imported DHIS2 Config.\n\nImport summary:${JSON.stringify(
        response.data.stats
      )}`
    )
  } catch (error) {
    throw new Error(`Failed to import DHIS2 config: ${error.message}`)
  }
}
