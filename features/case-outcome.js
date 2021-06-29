'use strict'

const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber')

const {
  sendCovid19CaseOutcome,
  verifyCovid19CaseOutcomeInDhis,
  verifyCovid19CaseOutcomeInFhir,
  cleanupCovid19CaseOutcome,
  ensurePractitionerExists
} = require('./utils')

setDefaultTimeout(30000)

Given('that the practitioner sending the reports exists', ensurePractitionerExists)

When('a case outcome is sent through', sendCovid19CaseOutcome)

Then('the case outcome should be stored in the fhir server', verifyCovid19CaseOutcomeInFhir)

Then('the case outcome should be also be available in dhis', verifyCovid19CaseOutcomeInDhis)

Then('the case outcome should then be deleted in both fhir and dhis', cleanupCovid19CaseOutcome)
