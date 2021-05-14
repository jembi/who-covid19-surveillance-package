Feature: Covid19 Lab Result

  Scenario: A lab result is sent
    Given that the required organizations have been created
    When the Covid19 lab result is sent through
    Then the lab result should exist in the fhir server
    And clean up should be done
