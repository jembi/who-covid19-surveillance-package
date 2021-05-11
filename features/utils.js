'use strict'

const axios = require('axios')
const fs = require('fs')

const DHIS2_PROTOCOL = process.env.DHIS2_PROTOCOL || 'http'
const DHIS2_API_HOSTNAME = process.env.DHIS2_API_HOSTNAME || 'localhost'
const DHIS2_API_PASSWORD = process.env.DHIS2_API_PASSWORD || 'district'
const DHIS2_API_PORT = process.env.DHIS2_API_PORT || 8081
const ORG_UNIT = process.env.ORG_UNIT || 'ImspTQPwCqd'
const DHIS2_API_USERNAME = process.env.DHIS2_API_USERNAME || 'admin'

const OPENHIM_PROTOCOL = process.env.OPENHIM_PROTOCOL || 'http'
const OPENHIM_API_HOSTNAME = process.env.OPENHIM_API_HOSTNAME || 'localhost'
const OPENHIM_TRANSACTION_API_PORT =
  process.env.OPENHIM_TRANSACTION_API_PORT || '5001'
const CUSTOM_TOKEN_ID = process.env.CUSTOM_TOKEN_ID || 'test'

const authHeader = new Buffer.from(
  `${DHIS2_API_USERNAME}:${DHIS2_API_PASSWORD}`
).toString('base64')

const patientId = '12305759751'
const patientId2 = '1234567'
const programId = 'uYjxkTbwRNf'
let trackedEntityId, trackedEntityId2, fhirBundleCaseReport, fhirBundleLabResult, organizationsBundle

const caseReportQuestionnaireResponse = JSON.parse(
  fs.readFileSync(`${__dirname}/resources/case-report-questionnaireResponse.json`, 'utf8')
)
const labResultQuestionnaireResponse = JSON.parse(
  fs.readFileSync(`${__dirname}/resources/lab-result-questionnaireResponse.json`, 'utf8')
)
const organization1 = JSON.parse(
  fs.readFileSync(`${__dirname}/resources/lab-result-organization1.json`, 'utf8')
)
const organization2 = JSON.parse(
  fs.readFileSync(`${__dirname}/resources/lab-result-organization2.json`, 'utf8')
)
const practitioner = JSON.parse(
  fs.readFileSync(`${__dirname}/resources/practitioner.json`, 'utf8')
)


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
    throw new Error(`DHIS2 issues: ${error.message}`)
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

const sendRequest = (path, payload={}, method='POST') => axios({
  url: `${OPENHIM_PROTOCOL}://${OPENHIM_API_HOSTNAME}:${OPENHIM_TRANSACTION_API_PORT}/${path}`,
  method: method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Custom ${CUSTOM_TOKEN_ID}`,
    'Cache-Control': 'no-cache'
  },
  data: JSON.stringify(payload)
})

exports.sendCovid19CaseReport = async () => {
  // Check whether the case report exists in DHIS
  let response = await axios({
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

  if (response.status == 200 && response.data.trackedEntityInstances.length) {
    throw Error('Test Covid19 Case report already exists')
  }

  response = await sendRequest('covid19-surveillance', caseReportQuestionnaireResponse)

  if (response.status !== 200) {
    throw Error('Covid19 Case report sending failed')
  }

  fhirBundleCaseReport = JSON.parse(response.data['resource-resolver-fhir'].response.body)
  console.log('Covid19 Case report successfully sent')
}

exports.ensurePractitionerExists = async () => {
  // First check whether the practitioner to be created already exists
  try {
    const response = await sendRequest(`fhir/Practitioner/${practitioner.id}`, {}, 'GET')

    if (response.status == 200) throw Error('Test Practitioner to be created exists in the system')
  } catch (error) {
    if (
      error &&
      error.response &&
      !(
        error.response.status == 404 ||
        error.response.status == 410
      )
    ) throw Error('Test Practitioner to be created exists in the system')
  }

  const response = await sendRequest(`fhir/Practitioner/${practitioner.id}`, practitioner, 'PUT')
  if (response.status != 201) throw Error('Test Practitioner resource not created')
  console.log('The test Practitioner that send the reports has been created');
}


exports.verifyCovid19CaseReportInFhir = async () => {
  if (
    !fhirBundleCaseReport ||
    !fhirBundleCaseReport.entry ||
    !fhirBundleCaseReport.entry.length
  ) throw Error('Covid19 Case report does not exist in FHIR')

  // Verify one of the resources in the bundle exists in fhir
  const response = await sendRequest(`fhir/${fhirBundleCaseReport.entry[0].response.location}`, {}, 'GET')

  if (response.status != 200) throw Error('Covid19 Case report resources not stored in FHIR')
  console.log('Covid19 Case report successfully stored in the FHIR server')
}

exports.verifyCovid19CaseReportInDhis = async () => {
  const response = await axios({
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
      filter: `he05i8FUwu3:EQ:${patientId2}`
    }
  })

  if (response.status != 200 || !response.data.trackedEntityInstances.length) {
    throw Error('Covid19 Case report verification failed')
  }
  trackedEntityId2 = response.data.trackedEntityInstances[0].trackedEntityInstance
  console.log('Covid19 Case report has been successfully registered in DHIS')
}

exports.cleanupCovid19CaseReport = async () => {
  const response = await axios({
    url: `${DHIS2_PROTOCOL}://${DHIS2_API_HOSTNAME}:${DHIS2_API_PORT}/api/trackedEntityInstances/${trackedEntityId2}`,
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${authHeader}`
      }
  })

  if (response.status !== 200 || !response.data.response.importCount.deleted) {
    throw Error('Covid19 Case report clean up failed in DHIS')
  }

  const deletesBundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: []
  }

  fhirBundleCaseReport.entry.forEach(resource => {
    if (
      resource &&
      resource.response &&
      resource.response.location
    ) {
      deletesBundle.entry.push({
        request: {
          method: 'DELETE',
          url: `${resource.response.location.split('/_')[0]}`
        }
      })
    }
  })

  const deleteResources = await sendRequest('fhir/', deletesBundle)

  if (deleteResources.status != 200) {
    throw Error('Covid19 Case report clean up failed in FHIR')
  }
  console.log('The test Covid19 Case report has been removed from the FHIR server')
}

exports.createLabResultOrganizations = async () => {
  const orgBundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {resource: organization1, request: {method: 'POST', url: 'Organization'}},
      {resource: organization2, request: {method: 'POST', url: 'Organization'}},
    ]
  }

  const response = await sendRequest('fhir/', orgBundle)

  if (response.status != 200) throw Error('The required organizations have not been created')
  organizationsBundle = response.data
  console.log('Covid19 Lab result organizations created')
}

exports.sendCovid19LabResult = async () => {
  const response = await sendRequest('lab-result', labResultQuestionnaireResponse)

  if (response.status !== 200) {
    throw Error('Covid19 Lab result sending failed')
  }
  fhirBundleLabResult = response.data
  console.log('Covid19 Lab result has been successfully sent')
}

exports.verifyCovid19LabResult = async () => {
  if (
    !fhirBundleLabResult ||
    !fhirBundleLabResult.entry ||
    !fhirBundleLabResult.entry.length
  ) throw Error('Covid19 Lab result does not exist in FHIR')

  // Verify one of the resources in the bundle exists in fhir
  const response = await sendRequest(`fhir/${fhirBundleLabResult.entry[0].response.location}`, {}, 'GET')

  if (response.status != 200) throw Error('Covid19 Lab result does not exist in FHIR')
  console.log('Covid19 Lab result has been successfully stored in the FHIR server')
}

exports.cleanupLabResult = async () => {
  const deletesBundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: []
  }

  fhirBundleLabResult.entry.concat(organizationsBundle.entry).forEach(resource => {
    if (
      resource &&
      resource.response &&
      resource.response.location
    ) {
      deletesBundle.entry.push({
        request: {
          method: 'DELETE',
          url: `${resource.response.location.split('/_')[0]}`
        }
      })
    }
  })

  // Delete practitioner
  deletesBundle.entry.push({
    request: {
      method: 'DELETE',
      url: `Practitioner/${practitioner.id}`
    }
  })

  const deleteResponse = await sendRequest('fhir/', deletesBundle)

  if (deleteResponse.status !== 200) {
    throw Error('Covid19 Lab Result clean up failed in FHIR')
  }
  console.log('The test Covid19 Lab result has been successfully removed from the FHIR server')
}
