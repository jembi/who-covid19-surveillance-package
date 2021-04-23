'use strict'

const axios = require('axios')

const DHIS2_PROTOCOL = process.env.DHIS2_PROTOCOL || 'http'
const DHIS2_API_HOSTNAME = process.env.DHIS2_API_HOSTNAME || 'localhost'
const DHIS2_API_PASSWORD = process.env.DHIS2_API_PASSWORD || 'district'
const DHIS2_API_PORT = process.env.DHIS2_API_PORT || 8081
const ORG_UNIT = process.env.ORG_UNIT || 'ImspTQPwCqd'
const DHIS2_API_USERNAME = process.env.DHIS2_API_USERNAME || 'admin'

const authHeader = new Buffer.from(
  `${DHIS2_API_USERNAME}:${DHIS2_API_PASSWORD}`
).toString('base64')
const patientId = '12305759751'
const programId = 'uYjxkTbwRNf'
let trackedEntityId

exports.verifyDhis2Configured = async () => {
  const options = {
    url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/trackedEntityTypes`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`
    }
  }

  try {
    const response = await axios(options)

    if (response && response.status === 200) {
      console.log(`DHIS2 running`)
    } else {
      throw new Error('DHIS2 NOT running!')
    }

    if (response && response.data && response.data.trackedEntityTypes && response.data.trackedEntityTypes[0].id == 'MCPQUTHX1Ze') {
      console.log(`DHIS2 configured correctly`)
    } else {
      throw new Error('DHIS2 config issue!')
    }
  } catch (error) {
    throw new Error(`DHIS2 issues!: ${error.message}`)
  }
}

exports.deletePatient = async () => {
 const result = await axios({
      url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/trackedEntityInstances/${trackedEntityId}`,
      method: 'DELETE',
      headers: {
      Authorization: `Basic ${authHeader}`
      }
  })

  if (result.status !== 200 || !result.data.response.importCount.deleted) {
    throw Error('Clean up failed - patient')
  }
}

exports.verifyPatientExists = async () => {
  const result = await axios({
    url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/trackedEntityInstances`,
    method: 'GET',
    headers: {
      "Content-Type": 'application/json',
      "Cache-Control": 'no-cache',
      Authorization: `Basic ${authHeader}`
    },
    params: {
      ouMode: 'DESCENDANTS',
      ou: ORG_UNIT,
      programId: programId,
      filter: `he05i8FUwu3:EQ:${patientId}`
    }
  })

  if (result.status != 200 || !result.data.trackedEntityInstances.length) {
    throw Error('Patient verification failed')
  }

  trackedEntityId = result.data.trackedEntityInstances[0].trackedEntityInstance
}

exports.createPatient = async () => {
  const data = {
    trackedEntityType: "MCPQUTHX1Ze",
    orgUnit: ORG_UNIT,
    attributes: [
      {
        attribute: "NI0QRzJvQ0k",
        value: "2011-04-13"
      },
      {
        attribute: "oindugucx72",
        value: "Male"
      },
      {
        attribute: 'Rv8WM2mTuS5',
        value: "10"
      },
      {
        attribute: "he05i8FUwu3",
        value: patientId
      }
    ],
    enrollments: [{
      orgUnit: ORG_UNIT,
      program: programId,
      enrollmentDate: new Date(),
      incidentDate: new Date()
    }]
  }

  const result = await axios({
    url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/trackedEntityInstances`,
    method: 'POST',
    headers: {
      "Content-Type": 'application/json',
      "Cache-Control": 'no-cache',
      Authorization: `Basic ${authHeader}`
    },
    data: JSON.stringify(data)
  })

  if (result.status != 200) {
    throw Error('Creation of patient failed')
  }
}
