# WHO COVID-19 Surveillance Package

This package sets up a mapping mediator instance to map COVID-19 QuestionnaireResponse FHIR resources to FHIR Bundles.

To enable this package within the Instant OpenHIE, mount this project directory with your Instant OpenHIE start command. More details available on the [Instant OpenHIE docs site](https://openhie.github.io/instant/docs/how-to/creating-packages#how-to-execute-your-new-package)

## Example message structures

The input message will be sent through the OpenHIM.

TODO: Channel config.

### Input

```json
{
  "resourceType": "QuestionnaireResponse",
  "id": "WhoCrQuestionnaireResponseBasic",
  "identifier": {
    "system": "http://test.org/response-id",
    "value": "1111"
  },
  "questionnaire": "http://openhie.github.io/covid-19/Questionnaire/WhoCrQuestionnaireCovid19Surveillance",
  "status": "completed",
  "authored": "2021-01-20T11:29:52+02:00",
  "author": {
    "reference": "Practitioner/WhoCrPractitionerExample"
  },
  "item": [
    {
      "linkId": "report_country",
      "text": "Reporting country:",
      "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.report.country",
      "answer": [
        {
          "valueCoding": {
            "code": "ZA",
            "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
          }
        }
      ]
    },
    {
      "linkId": "report_test_reason",
      "text": "Why tested for COVID-19:",
      "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.report.testReason",
      "answer": [
        {
          "valueCoding": {
            "code": "CASE_CONTACT",
            "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemReasonForTesting"
          }
        }
      ]
    },
    {
      "linkId": "section_patient_info",
      "text": "Patient information",
      "item": [
        {
          "linkId": "patinfo_ID",
          "text": "Unique Case Identifier (used in country):",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.patientInfo.caseId",
          "answer": [
            {
              "valueString": "123456789"
            }
          ]
        },
        {
          "linkId": "patinfo_ageonset",
          "text": "Age (use days if <1 month, months if <1 year):",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.patientInfo.onsetAge",
          "answer": [
            {
              "valueQuantity": {
                "value": 34,
                "code": "a",
                "system": "http://unitsofmeasure.org"
              }
            }
          ]
        },
        {
          "linkId": "patinfo_sex",
          "text": "Sex at birth:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.patientInfo.birthSex",
          "answer": [
            {
              "valueCoding": {
                "code": "male",
                "system": "http://hl7.org/fhir/administrative-gender"
              }
            }
          ]
        },
        {
          "linkId": "patinfo_placediagnosed",
          "text": "Place where the case was diagnosed:",
          "item": [
            {
              "linkId": "patinfo_idadmin0",
              "text": "Country:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.patientInfo.identified.country",
              "answer": [
                {
                  "valueCoding": {
                    "code": "ZA",
                    "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
                  }
                }
              ],
              "item": [
                {
                  "linkId": "patinfo_idadmin1",
                  "text": "Admin Level 1 (province):",
                  "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.patientInfo.identified.subnational",
                  "answer": [
                    {
                      "valueCoding": {
                        "code": "ZA-KZN",
                        "system": "urn:iso:std:iso:3166:-2"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "linkId": "section_clinical_status",
      "text": "Clinical Status",
      "item": [
        {
          "linkId": "Lab_date1",
          "text": "Date of first laboratory confirmation test:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.lab.confirmedDate",
          "answer": [
            {
              "valueDate": "2021-01-20"
            }
          ]
        },
        {
          "linkId": "patcourse_asymp",
          "text": "Any symptoms or signs at time of specimen collection that resulted in first laboratory confirmation?",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.asymptomatic",
          "answer": [
            {
              "valueCoding": {
                "code": "Y",
                "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
              }
            }
          ],
          "item": [
            {
              "linkId": "patcourse_dateonset",
              "text": "Date of onset of symptoms:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.onsetDate",
              "answer": [
                {
                  "valueDate": "2021-01-15"
                }
              ]
            }
          ]
        },
        {
          "linkId": "section_comorbidity",
          "text": "Underlying conditions and comorbidity:",
          "item": [
            {
              "linkId": "Comcond_any",
              "text": "Any underlying conditions?",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.comorbidities.any",
              "answer": [
                {
                  "valueCoding": {
                    "code": "N",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "linkId": "section_exposure_risk",
      "text": "Exposure risk in the 14 days prior to symptom onset (prior to testing if asymptomatic)",
      "item": [
        {
          "linkId": "expo_travel",
          "text": "Has the case travelled in the 14 days prior to symptom onset?",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.travel.hasTravelled",
          "answer": [
            {
              "valueCoding": {
                "code": "N",
                "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Corresponding Output

```json
{
  "resourceType": "Bundle",
  "id": "WhoCrBundleExample",
  "type": "document",
  "entry": [
    {
      "fullUrl": "http://test.org/fhir/Composition/WhoCrCompositionBasicExample",
      "resource": {
        "resourceType": "Composition",
        "id": "WhoCrCompositionBasicExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-composition-basic"
          ]
        },
        "type": {
          "coding": [
            {
              "code": "95412-3",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "identifier": {
          "system": "http://test.org/identifier/who-covid-19-case-report",
          "value": "1111"
        },
        "encounter": {
          "reference": "Encounter/WhoCrEncounterExample"
        },
        "date": "2021-01-18",
        "author": [
          {
            "reference": "Practitioner/WhoCrPractitionerExample"
          }
        ],
        "title": "WHO COVID-19 Case Report",
        "section": [
          {
            "title": "patient information",
            "code": {
              "coding": [
                {
                  "code": "patientinformation",
                  "system": "http://test.org/sectionCode"
                }
              ]
            },
            "entry": [
              {
                "reference": "Observation/WhoCrObservationAgeExample"
              },
              {
                "reference": "Observation/WhoCrObservationBirthSexExample"
              }
            ]
          },
          {
            "title": "clinical status",
            "code": {
              "coding": [
                {
                  "code": "clinicalStatus",
                  "system": "http://test.org/sectionCode"
                }
              ]
            },
            "entry": [
              {
                "reference": "Observation/WhoCrObservationLabTestDateExample"
              },
              {
                "reference": "Observation/WhoCrObservationSymptomsExample"
              },
              {
                "reference": "Observation/WhoCRObservationOnsetDateExample"
              },
              {
                "reference": "Observation/WhoCrObservationComorbiditiesExample"
              }
            ]
          },
          {
            "title": "exposure risk",
            "code": {
              "coding": [
                {
                  "code": "exposureRisk",
                  "system": "http://test.org/sectionCode"
                }
              ]
            },
            "entry": [
              {
                "reference": "Observation/WhoCrObservationHasTravelledExample"
              }
            ]
          }
        ]
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Encounter/WhoCrEncounterExample",
      "resource": {
        "resourceType": "Encounter",
        "id": "WhoCrEncounterExample",
        "location": [
          {
            "location": {
              "reference": "Location/WhoCrLocationExample"
            }
          }
        ],
        "status": "finished",
        "class": {
          "code": "ACUTE",
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
        }
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationAgeExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationAgeExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-age"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "30525-0",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "valueQuantity": {
          "value": 35
        }
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationBirthSexExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationBirthSexExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-birth-sex"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "76689-9",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "male",
              "system": "http://hl7.org/fhir/administrative-gender"
            }
          ]
        }
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationLabTestDateExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationLabTestDateExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-lab-test-date"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "lab-test-date",
              "system": "http://test.org/obsCode"
            }
          ]
        },
        "status": "final",
        "valueDateTime": "2021-01-18"
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationSymptomsExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationSymptomsExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-symptoms"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "symptoms",
              "system": "http://test.org/obsCode"
            }
          ]
        },
        "status": "final",
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        }
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCRObservationOnsetDateExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCRObservationOnsetDateExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-onset-date"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "65222-2",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "valueDateTime": "2021-01-15"
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationComorbiditiesExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationComorbiditiesExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-comorbidities"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "75618-9",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        }
      }
    },
    {
      "fullUrl": "http://test.org/fhir/Observation/WhoCrObservationHasTravelledExample",
      "resource": {
        "resourceType": "Observation",
        "id": "WhoCrObservationHasTravelledExample",
        "meta": {
          "profile": [
            "http://openhie.github.io/covid-19/StructureDefinition/who-cr-observation-has-travelled"
          ]
        },
        "code": {
          "coding": [
            {
              "code": "96542-6",
              "system": "http://loinc.org"
            }
          ]
        },
        "status": "final",
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        }
      }
    }
  ]
}
```
