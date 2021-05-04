#!/bin/bash

k8sImporterRootFilePath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )


if [ "$1" == "up" ]; then
    kubectl create configmap dhis2-metadata-configmap --from-file "$k8sImporterRootFilePath/volume/dhis2"
    kubectl apply -k $k8sImporterRootFilePath
elif [ "$1" == "clean" ]; then
    kubectl delete -k $k8sImporterRootFilePath
    kubectl delete jobs,persistentvolumeclaim --all
else
    echo "Valid options are: up, or clean"
fi
