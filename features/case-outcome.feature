Feature: Covid19 Case Outcome

  Scenario: A case outcome is sent
    Given that the practitioner sending the reports exists
    When a case outcome is sent through
    Then the case outcome should be stored in the fhir server
    And the case outcome should be also be available in dhis
    And the case outcome should then be deleted in both fhir and dhis
