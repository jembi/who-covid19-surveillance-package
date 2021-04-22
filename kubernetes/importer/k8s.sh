#!/bin/bash

k8sImporterRootFilePath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )


if [ "$1" == "up" ]; then
    kubectl apply -k $k8sImporterRootFilePath
    
    actions() {
      dhis2PodName=$( kubectl get pods --selector=component=dhis-metadata-config-importer -o jsonpath='{.items[*].metadata.name}' )
    }

    actions #1st execution
    while [ -z "$dhis2PodName" ]; do
        echo "DHIS2 Importer pod not ready. Sleep 2"
        sleep 2
        actions
        echo "Pod Name: $dhis2PodName"
    done
    
    kubectl cp "$k8sImporterRootFilePath/volume/dhis2/metadata.js" $dhis2PodName:/importer -c check-config-files-exist
    kubectl cp "$k8sImporterRootFilePath/volume/dhis2/metadata.json.gz" $dhis2PodName:/importer -c check-config-files-exist
elif [ "$1" == "clean" ]; then
    kubectl delete -k $k8sImporterRootFilePath
    kubectl delete jobs,persistentvolumeclaim --all
else
    echo "Valid options are: up, or clean"
fi
