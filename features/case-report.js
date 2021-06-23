'use strict'

const {When, Then, setDefaultTimeout} = require('@cucumber/cucumber')

const {
  sendCovid19CaseReport,
  verifyCovid19CaseReportInDhis,
  verifyCovid19CaseReportInFhir,
  cleanupCovid19CaseReport
} = require('./utils')

setDefaultTimeout(30000)

When('a case report is sent through', sendCovid19CaseReport)

Then('the case report should be stored in the fhir server', verifyCovid19CaseReportInFhir)

Then('it should be also be available in dhis', verifyCovid19CaseReportInDhis)

Then('it should then be deleted in both fhir and dhis', cleanupCovid19CaseReport)
