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

**NB** The alias for the option `--custom-package` is `-c`

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

The Covid19 Surveillance Mediator contains an endpoint that transforms the data into the format used by the Tracker Populator. This schema is where the input data is assigned to the specified DHIS2 Data Element or Attribute field. To create this kind of mapping in your own instance, you would require metadata admin access to your DHIS2 package to complete the schema.

The DHIS2 Tracker Populator Mediator has a fairly generic flow to add data into DHIS2. The only DHIS2 instance specific details needed here are a few high level DHIS2 UIDs relating to the program. The UIDs needed are as follows:

- Top Level Organisation unit - in this package: `ImspTQPwCqd`
- A Tracked Entity Identifier (a unique Tracked Entity Attribute) - in this package: `he05i8FUwu3`

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
    "reference": "Practitioner/1844391y"
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
      "linkId": "report_date",
      "text": "Date of Reporting:",
      "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.report.reportDate",
      "answer": [
        {
          "valueDate": "2021-01-20"
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
            },
            {
              "linkId": "patcourse_admit",
              "text": "Hospital Admission Indicator:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.wasAdmitted",
              "answer": [
                {
                  "valueCoding": {
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "patcourse_presHCF",
              "text": "First Hospital Admission Date:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.admitDate",
              "answer": [
                {
                  "valueDate": "2021-01-15"
                }
              ]
            },
            {
              "linkId": "patcourse_icu",
              "text": "Intensive Care Received:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.receivedIcuCare",
              "answer": [
                {
                  "valueCoding": {
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "patcourse_vent",
              "text": "Ventilation Received:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.ventilated",
              "answer": [
                {
                  "valueCoding": {
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "patcourse_ecmo",
              "text": "Did the case receive extracorporeal membrane oxygenation?:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.receivedEcmo",
              "answer": [
                {
                  "valueCoding": {
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "patcourse_iso",
              "text": "Is case in isolation with Infection Control Practice in place?",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.wasIsolated",
              "answer": [
                {
                  "valueCoding": {
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "patcourse_dateiso",
              "text": "Date of isolation:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.patientCourse.isolatedDate",
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
                    "code": "Y",
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
                  }
                }
              ]
            },
            {
              "linkId": "comcond",
              "text": "Patient Underlying Conditions:",
              "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.clinicalStatus.comorbidities.conditions",
              "answer": [
                {
                  "valueCoding": {
                    "code": "DIABETES",
                    "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemComorbidity"
                  }
                },
                {
                  "valueCoding": {
                    "code": "PREGNANCY",
                    "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemComorbidity"
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
          "linkId": "patinfo_occuhcw",
          "text": "Is case a Health Care Worker (any job in a health care setting):",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.travel.isHealthcareWorker",
          "answer": [
            {
              "valueCoding": {
                "code": "N",
                "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
              }
            }
          ]
        },
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
        },
        {
          "linkId": "expo_travel_country",
          "text": "Country:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.travel.location.country",
          "answer": [
            {
              "valueCoding": {
                "code": "ZW",
                "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
              }
            }
          ]
        },
        {
          "linkId": "expo_travel_city",
          "text": "City:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.travel.location.city",
          "answer": [
            {
              "valueString": "Harare"
            }
          ]
        },
        {
          "linkId": "expo_travel_date",
          "text": "Date of Departure from the place:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.travel.location.locationPeriod.end",
          "answer": [
            {
              "valueDate": "2021-01-15"
            }
          ]
        },
        {
          "linkId": "expo_visit_healthcare",
          "text": "Has case visited any health care facility in the 14 days prior to symptom onset?",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.visitedHealthcare",
          "answer": [
            {
              "valueCoding": {
                "code": "N",
                "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
              }
            }
          ]
        },
        {
          "linkId": "expo_contact_case",
          "text": "Has case had contact with a confirmed case in the 14 days prior to symptom onset?",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.contact.hadContact",
          "answer": [
            {
              "valueCoding": {
                "code": "N",
                "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
              }
            }
          ]
        },
        {
          "linkId": "expo_case_setting_detail",
          "text": "Contact Setting:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.contact.contact.exposure.setting",
          "answer": [
            {
              "valueString": "Home"
            }
          ]
        },
        {
          "linkId": "expo_ID1",
          "text": "Contact ID:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.contact.contact.identifier",
          "answer": [
            {
              "valueString": "+2777888888"
            }
          ]
        },
        {
          "linkId": "expo_case_date_first",
          "text": "First Date of Contact:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.contact.contact.exposure.period.begin",
          "answer": [
            {
              "valueDate": "2021-01-15"
            }
          ]
        },
        {
          "linkId": "expo_case_date_last",
          "text": "Last Date of Contact:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary.exposure.contact.contact.exposure.period.end",
          "answer": [
            {
              "valueDate": "2021-01-17"
            }
          ]
        },
        {
          "linkId": "expo_case_location",
          "text": "Most likely country of exposure:",
          "definition": "http://openhie.github.io/covid-19/StructureDefinition/WhoCrSurveillanceDataDictionary#WhoCrSurveillanceDataDictionary..exposure.contact.country",
          "answer": [
            {
              "valueCoding": {
                "code": "ZW",
                "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
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
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Composition",
        "type": {
          "coding": [{ "code": "95412-3", "system": "http://loinc.org" }]
        },
        "status": "final",
        "identifier": {
          "system": "http://test.org/identifier/who-covid-19-case-report",
          "value": "123456789"
        },
        "encounter": { "reference": "urn:uuid:92984469334599" },
        "author": [{ "reference": "Practitioner/1844391y" }],
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
              { "reference": "urn:uuid:550598074398342" },
              { "reference": "urn:uuid:567618776220275" }
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
              { "reference": "urn:uuid:0558627936725375" },
              { "reference": "urn:uuid:80139664661405" },
              { "reference": "urn:uuid:764073491561028" },
              { "reference": "urn:uuid:15791239164346" },
              { "reference": "urn:uuid:148961659797258" },
              { "reference": "urn:uuid:798228396400571" },
              { "reference": "urn:uuid:871204281919977" },
              { "reference": "urn:uuid:948070869743333" },
              { "reference": "urn:uuid:0436824739975563" },
              { "reference": "urn:uuid:602777289150051" },
              { "reference": "urn:uuid:507059939525307" },
              { "reference": "urn:uuid:391509353985015" },
              { "reference": "urn:uuid:562750380722932" }
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
              { "reference": "urn:uuid:964251889468667" },
              { "reference": "urn:uuid:752280133489467" },
              { "reference": "urn:uuid:566209579060944" },
              { "reference": "urn:uuid:279695879661603" }
            ]
          }
        ],
        "date": "2021-06-22",
        "section[1]": {
          "entry": [
            {
              "reference": [
                "urn:uuid:665719920671014",
                "urn:uuid:0520145048026721"
              ]
            }
          ]
        }
      },
      "request": { "method": "POST", "url": "Composition" },
      "fullUrl": "urn:uuid:45910466258278"
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "status": "in-progress",
        "class": {
          "code": "ACUTE",
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
        },
        "location": [
          { "location": { "reference": "Location/covid19249937372146211" } }
        ],
        "period": { "start": "2021-01-20" }
      },
      "request": { "method": "POST", "url": "Encounter" },
      "fullUrl": "urn:uuid:92984469334599"
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "status": "in-progress",
        "class": {
          "code": "ACUTE",
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
        },
        "period": { "start": "2021-01-15" }
      },
      "request": { "method": "POST", "url": "Encounter" },
      "fullUrl": "urn:uuid:562750380722932"
    },
    {
      "fullUrl": "urn:uuid:550598074398342",
      "resource": {
        "valueQuantity": {
          "code": "1734",
          "system": "https://openconceptlab.org/orgs/CIEL/sources/CIEL/concepts",
          "value": 34
        },
        "code": {
          "coding": [{ "code": "30525-0", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:567618776220275",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "male",
              "system": "http://hl7.org/fhir/administrative-gender"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "76689-9", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:0558627936725375",
      "resource": {
        "valueDateTime": "2021-01-20",
        "code": {
          "coding": [
            { "code": "lab-test-date", "system": "http://test.org/obsCode" }
          ]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:80139664661405",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [
            { "code": "symptoms", "system": "http://test.org/obsCode" }
          ]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:764073491561028",
      "resource": {
        "valueDateTime": "2021-01-15",
        "code": {
          "coding": [{ "code": "65222-2", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:15791239164346",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "75618-9", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:964251889468667",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "96542-6", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:148961659797258",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "CASE_CONTACT",
              "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemReasonForTesting"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "67098-4", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:798228396400571",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "ZA",
              "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "77967-8", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:871204281919977",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "77974-4", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:948070869743333",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "95420-6", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:0436824739975563",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "96539-2", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:602777289150051",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "96540-0", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:507059939525307",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "component": [{}],
        "code": {
          "coding": [{ "code": "96548-3", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:391509353985015",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "95418-0", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:752280133489467",
      "resource": {
        "valueCodeableConcept": { "coding": [] },
        "component": [
          { "code": { "code": "94653-3", "system": "http://loinc.org" } }
        ],
        "code": {
          "coding": [{ "code": "94651-7", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:566209579060944",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {
          "coding": [{ "code": "96543-4", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:279695879661603",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "component": [
          {
            "valueString": "Home",
            "code": { "code": "81267-7", "system": "http://loinc.org" }
          },
          {
            "valueString": "+2777888888",
            "code": { "code": "94650-9", "system": "http://loinc.org" }
          },
          {
            "valueDateTime": "2021-01-15",
            "code": { "code": "96545-9", "system": "http://loinc.org" }
          },
          {
            "valueDateTime": "2021-01-17",
            "code": { "code": "95386-9", "system": "http://loinc.org" }
          },
          {
            "valueCodeableConcept": {
              "coding": [
                {
                  "code": "ZW",
                  "system": "http://hl7.org/fhir/ValueSet/iso3166-1-2"
                }
              ]
            },
            "code": { "code": "77984-3", "system": "http://loinc.org" }
          }
        ],
        "code": {
          "coding": [{ "code": "96544-2", "system": "http://loinc.org" }]
        },
        "resourceType": "Observation",
        "status": "final"
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "fullUrl": "urn:uuid:665719920671014",
      "resource": {
        "code": {
          "coding": {
            "code": "DIABETES",
            "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemComorbidity"
          }
        },
        "resourceType": "Condition"
      },
      "request": { "method": "POST", "url": "Condition" }
    },
    {
      "fullUrl": "urn:uuid:0520145048026721",
      "resource": {
        "code": {
          "coding": {
            "code": "PREGNANCY",
            "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCrCodeSystemComorbidity"
          }
        },
        "resourceType": "Condition"
      },
      "request": { "method": "POST", "url": "Condition" }
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

## Example - Case Outcome Message Structure

The input message will be sent through the OpenHIM and then it will be sent to FHIR and DHIS2.

The OpenHIM channel is accessible on the endpoint <http://localhost:5001/case-outcome>. Any client with the role **instant** can access the channel using basic authentication (`username and password`) or custom token authentication (`Authorization : Custom <Token>`)

This flow makes some assumptions about the existing HAPI FHIR instance:

- A Practitioner resource exists with FHIR ID `doc1452`

These assumptions are made as we do not yet support the client registry responsibilities.

### Input

```json
{
  "resourceType": "QuestionnaireResponse",
  "id": "WhoCoQuestionnaireResponse",
  "identifier": {
    "system": "http://test.org/response-id",
    "value": "1111"
  },
  "questionnaire": "http://openhie.github.io/covid-19/Questionnaire/WhoCoQuestionnaire",
  "status": "completed",
  "authored": "2021-01-20T11:29:52+02:00",
  "author": {
    "reference": "Practitioner/doc1452"
  },
  "item": [
    {
      "linkId": "patinfo_ID",
      "text": "Unique Case Identifier",
      "answer": [
        {
          "valueString": "123456789"
        }
      ]
    },
    {
      "linkId": "outcome_report_date",
      "text": "Date of re-submission for this report",
      "answer": [
        {
          "valueDateTime": "2021-05-13"
        }
      ]
    },
    {
      "linkId": "outcome_date_of_outcome",
      "text": "Date of Release from isolation/hospital or Date of Death",
      "answer": [
        {
          "valueDateTime": "2021-05-13"
        }
      ]
    },
    {
      "linkId": "outcome_asymp",
      "text": "Developed symptoms after time of specimen collection",
      "answer": [
        {
          "valueCoding": {
            "code": "Y",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
          }
        }
      ]
    },
    {
      "linkId": "outcome_asymp_date",
      "text": "Date of onset of symptoms/signs of illness",
      "answer": [
        {
          "valueDateTime": "2021-05-13"
        }
      ]
    },
    {
      "linkId": "patcourse_admit",
      "text": "Admission to hospital (may have been previously reported)",
      "answer": [
        {
          "valueCoding": {
            "code": "Y",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
          }
        }
      ]
    },
    {
      "linkId": "admission_date",
      "text": "First date of admission to hospital",
      "answer": [
        {
          "valueDateTime": "2021-05-13"
        }
      ]
    },
    {
      "linkId": "outcome_patcourse_icu",
      "text": "Did the case receive care in an intensive care unit (ICU)",
      "answer": [
        {
          "valueCoding": {
            "code": "N",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
          }
        }
      ]
    },
    {
      "linkId": "outcome_patcourse_vent",
      "text": "Did the case receive ventilation",
      "answer": [
        {
          "valueCoding": {
            "code": "UNK",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
          }
        }
      ]
    },
    {
      "linkId": "outcome_patcourse_ecmo",
      "text": "Did the case receive extracorporeal membrane oxygenation",
      "answer": [
        {
          "valueCoding": {
            "code": "Y",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
          }
        }
      ]
    },
    {
      "linkId": "outcome_patcourse_status",
      "text": "Health Outcome",
      "answer": [
        {
          "valueCoding": {
            "code": "OTHER",
            "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCoHealthOutcome"
          }
        }
      ]
    },
    {
      "linkId": "outcome_patcourse_status_other",
      "text": "If other, please explain",
      "answer": [
        {
          "valueString": "N/A"
        }
      ]
    },
    {
      "linkId": "outcome_lab_date",
      "text": "If released from hospital /isolation, date of last laboratory test",
      "answer": [
        {
          "valueDateTime": "2021-05-13"
        }
      ]
    },
    {
      "linkId": "outcome_lab_result",
      "text": "Results of last test",
      "answer": [
        {
          "valueCoding": {
            "code": "positive",
            "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCoPositiveNegativeUnknown"
          }
        }
      ]
    },
    {
      "linkId": "outcome_contacts_followed",
      "text": "Total number of contacts followed for this case",
      "answer": [
        {
          "valueInteger": 5
        }
      ]
    }
  ]
}
```

### Corresponding Output that will be stored in the FHIR server

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Composition",
        "type": {"coding": [{"code": "95412-3", "system": "http://loinc.org"}]},
        "status": "final",
        "identifier": {
          "system": "http://test.org/identifier/who-covid-19-case-outcome",
          "value": "123456789"
        },
        "encounter": {"reference": "urn:uuid:94976331728655"},
        "author": [{"reference": "Practitioner/1844391y"}],
        "title": "WHO COVID-19 Case Outcome",
        "section": [
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
              {"reference": "urn:uuid:94976331728655"},
              {"reference": "urn:uuid:203155906139894"},
              {"reference": "urn:uuid:455719316166893"},
              {"reference": "urn:uuid:222214635598315"},
              {"reference": "urn:uuid:388170145026748"},
              {"reference": "urn:uuid:346620203461778"},
              {"reference": "urn:uuid:949258897864128"},
              {"reference": "urn:uuid:648726946521651"},
              {"reference": "urn:uuid:02063039706351"},
              {"reference": "urn:uuid:678524501114971"},
              {"reference": "urn:uuid:392692899557129"},
              {"reference": "urn:uuid:924867647670974"}
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
            "entry": [{"reference": "urn:uuid:298020334930571"}]
          }
        ]
      },
      "request": {"method": "POST", "url": "Composition"},
      "fullUrl": "urn:uuid:418322796048621"
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "class": {
          "code": "ACUTE",
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
        },
        "status": "finished",
        "period": {"end": "2021-05-13"}
      },
      "request": {"method": "POST", "url": "Encounter"},
      "fullUrl": "urn:uuid:94976331728655"
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "class": {
          "code": "ACUTE",
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
        },
        "status": "in-progress",
        "period": {"start": "2021-05-13"}
      },
      "request": {"method": "POST", "url": "Encounter"},
      "fullUrl": "urn:uuid:203155906139894"
    },
    {
      "fullUrl": "urn:uuid:455719316166893",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {"coding": [{"code": "66421-9", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:222214635598315",
      "resource": {
        "effectiveDateTime": "2021-05-13",
        "code": {"coding": [{"code": "65222-2", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:388170145026748",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {"coding": [{"code": "77974-4", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:346620203461778",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "N",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {"coding": [{"code": "95420-6", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:949258897864128",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "UNK",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {"coding": [{"code": "96539-2", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:648726946521651",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "Y",
              "system": "http://terminology.hl7.org/CodeSystem/v2-0136"
            }
          ]
        },
        "code": {"coding": [{"code": "96540-0", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:02063039706351",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "other",
              "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCoHealthOutcome"
            }
          ]
        },
        "code": {"coding": [{"code": "91541-3", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:678524501114971",
      "resource": {
        "valueString": "N/A",
        "code": {"coding": [{"code": "91541-3", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:392692899557129",
      "resource": {
        "effectiveDateTime": "2021-05-13",
        "code": {"coding": [{"code": "96550-9", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:924867647670974",
      "resource": {
        "valueCodeableConcept": {
          "coding": [
            {
              "code": "positive",
              "system": "http://openhie.github.io/covid-19/CodeSystem/WhoCoPositiveNegativeUnknown"
            }
          ]
        },
        "code": {"coding": [{"code": "96552-5", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    },
    {
      "fullUrl": "urn:uuid:298020334930571",
      "resource": {
        "valueInteger": 5,
        "code": {"coding": [{"code": "96551-7", "system": "http://loinc.org"}]},
        "resourceType": "Observation",
        "status": "final"
      },
      "request": {"method": "POST", "url": "Observation"}
    }
  ]
}
```
