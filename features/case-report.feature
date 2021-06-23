Feature: Covid19 Case report

  Scenario: A case report is sent
    When a case report is sent through
    Then the case report should be stored in the fhir server
    And it should be also be available in dhis
    And it should then be deleted in both fhir and dhis
