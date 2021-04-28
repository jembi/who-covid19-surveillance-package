#!/bin/bash

sleep 10

composeFilePath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

if [ "$1" == "init" ]; then
    docker create --name file-queue-helper -v file-queue-config:/config busybox
    docker cp "$composeFilePath"/importer/volume/file-queue/mediator.json file-queue-helper:/config/
    docker rm file-queue-helper

    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml up -d
elif [ "$1" == "up" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml up -d
elif [ "$1" == "down" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml stop
elif [ "$1" == "destroy" ]; then
    docker-compose -p instant -f "$composeFilePath"/docker-compose.yml -f "$composeFilePath"/docker-compose.dev.yml -f "$composeFilePath"/importer/docker-compose.config.yml down
else
    echo "Valid options are: init, up, down, or destroy"
fi
