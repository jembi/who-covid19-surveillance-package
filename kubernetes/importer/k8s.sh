#!/bin/bash

k8sImporterRootFilePath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )


if [ "$1" == "up" ]; then
    kubectl apply -k $k8sImporterRootFilePath
    
    kubectl cp "$k8sImporterRootFilePath/volume/dhis2/metadata.js" $dhis2PodName:/importer -c check-config-files-exist
    kubectl cp "$k8sImporterRootFilePath/volume/dhis2/metadata.json.gz" $dhis2PodName:/importer -c check-config-files-exist
elif [ "$1" == "clean" ]; then
    kubectl delete -k $k8sImporterRootFilePath
    kubectl delete jobs,persistentvolumeclaim --all
else
    echo "Valid options are: up, or clean"
fi
