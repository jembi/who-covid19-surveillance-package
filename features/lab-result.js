'use strict'

const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')

const {
  createLabResultOrganizations,
  sendCovid19LabResult,
  verifyCovid19LabResult,
  cleanupLabResult
} = require('./utils')

setDefaultTimeout(30000)

Given('that the required organizations have been created', createLabResultOrganizations)

When('the Covid19 lab result is sent through', sendCovid19LabResult)

Then('the lab result should exist in the fhir server', verifyCovid19LabResult)

Then('clean up should be done', cleanupLabResult)
