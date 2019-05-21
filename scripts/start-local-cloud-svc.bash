# /bin/bash
docker run -d --rm --name shio-pubsub -p 8085:8085 -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators pubsub start --host-port=0.0.0.0:8085
docker run -d --name shio-datastore -p 5545:5545 -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators datastore start --host-port=0.0.0.0:5545