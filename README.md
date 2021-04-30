# WHO COVID-19 Surveillance Package

This package sets up a mapping mediator instance to map COVID-19 QuestionnaireResponse FHIR resources to FHIR Bundles adhering to the [WHO-CR-COVID19](https://openhie.github.io/covid-ig/) implementation guide.

To enable this package within the Instant OpenHIE, mount this project directory with your Instant OpenHIE start command. More details available on the [Instant OpenHIE docs site](https://openhie.github.io/instant/docs/how-to/creating-packages#how-to-execute-your-new-package)

## Starting Up

To mount the package into an Instant OpenHIE instance, clone the repository and run the following command

### Docker

```sh
yarn docker:instant init core covid19surveillance -custom-package="<Path to package>"
```

### Kubernetes

```sh
yarn docker:instant init -t k8s core covid19surveillance --custom-package="<Path to package>"
```

**NB** The alias for the option ``--custom-package`` is ``-c``

Once the package has been initialized, the following commands can be run to start, stop or destroy the instance.

### Docker

```sh
yarn docker:instant up -t docker core covid19surveillance
yarn docker:instant down -t docker core covid19surveillance
yarn docker:instant destroy -t docker core covid19surveillance
```

### Kubernetes

```sh
yarn docker:instant up -t docker core covid19surveillance
yarn docker:instant down -t docker core covid19surveillance
yarn docker:instant destroy -t docker core covid19surveillance
```

## DHIS2

This package contains a DHIS2 Tracker Populator mediator which interacts with a preconfigured DHIS2 instance. This package also contains scripts for configuring the DHIS2 instance for this usecase.
The DHIS2 metadata config is imported automatically on the `init` command. The import scripts will import the specified metadata into the existing DHIS2 instance that is setup by the `health-management-information-system` package in the Instant OpenHIE project.

### Mediator

The DHIS2 Tracker Populator Mediator will be spun up automatically and configured with the necessary endpoints via config and importer scripts in Docker or Kubernetes respectively.
To send data to DHIS2, a Case Report QuestionnaireResponse can be sent to the OpenHIM transactions endpoint at the path `/covid19-surveillance` - the mediator will route this data through the surveillance mediator which will map the data into a format accepted by the Tracker Populator. The surveillance mediator will send the request to the Tracker Populator Mediator directly (as well as to HAPI-FHIR).

## Example Coivd19 Surveillance Message Structures

The input message will be sent through the OpenHIM.

The OpenHIM channel is accessible on the endpoint <http://localhost:5001/covid19-surveillance>. Any client with the role **instant** can access the channel using basic authentication (`username and password`) or custom token authentication (`Authorization : Custom <Token>`)

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
    "reference": "Practitioner/1844391"
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
                "value": 11,
                "code": "d",
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
                        "code": "KZN",
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
  "type": "transaction",
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
      },
      "request": {
        "method": "POST",
        "url": "Composition"
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
      },
      "request": {
        "method": "POST",
        "url": "Encounter"
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
          "value": 34,
          "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL/concepts/",
          "code": "1734"
        }
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
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
      },
      "request": {
        "method": "POST",
        "url": "Observation"
      }
    }
  ]
}
```

The corresponding output will then be sent to a FHIR server.

## Example Lab Result Message Structure

This flow makes some assumptions about the existing HAPI FHIR instance:

- A Practitioner resource exists with FHIR ID `doc123`
- An Organization resource exists with the identifier `123456`
- An Organization resource exists with the name `KEMRI Clinic`

These assumptions are made as we do not yet support the client registry and facility registry responsibilities.

### Input

```json
{
  "resourceType": "QuestionnaireResponse",
  "id": "WhoLrQuestionnaireResponse",
  "identifier": {
    "system": "http://test.org/response-id",
    "value": "1111"
  },
  "questionnaire": "http://openhie.github.io/covid-19/Questionnaire/WhoLrQuestionnaire",
  "status": "completed",
  "authored": "2021-01-20T11:29:52+02:00",
  "author": {
    "reference": "Practitioner/doc123"
  },
  "item": [
    {
      "linkId": "labreport_ID",
      "text": "Unique lab result identifier:",
      "answer": [
        {
          "valueString": "123456789"
        }
      ]
    },
    {
      "linkId": "testLab_id",
      "text": "Lab that conducted the test:",
      "answer": [
        {
          "valueString": "123456"
        }
      ]
    },
    {
      "linkId": "section_patient_info",
      "text": "Patient information",
      "item": [
        {
          "linkId": "patinfo_ID",
          "text": "Patient unique ID:",
          "answer": [
            {
              "valueString": "123456789"
            }
          ]
        },
        {
          "linkId": "patinfo_name",
          "text": "Patient Name:",
          "answer": [
            {
              "valueString": "Rob Stark"
            }
          ]
        },
        {
          "linkId": "patinfo_idadmin1",
          "text": "Patient County:",
          "answer": [
            {
              "valueString": "City of Cape Town"
            }
          ]
        },
        {
          "linkId": "patinfo_dob",
          "text": "Date of Birth:",
          "answer": [
            {
              "valueDate": "2021-01-20"
            }
          ]
        },
        {
          "linkId": "patinfo_sex",
          "text": "Sex at birth:",
          "answer": [
            {
              "valueCoding": {
                "code": "male",
                "system": "http://hl7.org/fhir/administrative-gender"
              }
            }
          ]
        }
      ]
    },
    {
      "linkId": "Lab_date1",
      "text": "Lab Confirmation Test Date:",
      "answer": [
        {
          "valueDate": "2021-01-20"
        }
      ]
    },
    {
      "linkId": "test_result",
      "text": "Overall Result:",
      "answer": [
        {
          "valueString": "Positive"
        }
      ]
    },
    {
      "linkId": "ordering_clinic",
      "text": "Clinic that requested the test:",
      "answer": [
        {
          "valueString": "KEMRI Clinic"
        }
      ]
    },
    {
      "linkId": "test_type",
      "text": "Type of Test:",
      "answer": [
        {
          "valueString": "COVID-19 PCR TEST"
        }
      ]
    },
    {
      "linkId": "specimen_type",
      "text": "Sample Type:",
      "answer": [
        {
          "valueString": "Respiratory Swab"
        }
      ]
    }
  ]
}
```
