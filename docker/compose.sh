#!/bin/bash

sleep 10

composeFilePath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

if [ "$1" == "init" ]; then
    docker create --name file-queue-helper -v file-queue-config:/config busybox
    docker cp "$composeFilePath"/importer/volume/file-queue/mediator.json file-queue-helper:/config/
    docker rm file-queue-helper

    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml up -d

    echo "Sleep 90 - Give importers time to complete"
    sleep 90

    # docker rm covid19-surveillance-openhim-config-importer covid19-surveillance-config-importer dhis2-tracker-populator-config-importer hapi-fhir-config-importer dhis2-config-importer
elif [ "$1" == "up" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml up -d
elif [ "$1" == "down" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml stop
elif [ "$1" == "destroy" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml down

    echo "Sleep 10. Give containers time to shut down before deleting volume"
    sleep 10

    docker volume rm file-queue-config
else
    echo "Valid options are: init, up, down, or destroy"
fi
