


## Development local with GCloud service emulator
### CloudDatastore
```
$ docker run -d --name my-datastore -p 8081 -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators datastore start --host-port=0.0.0.0:8081
```

### CloudPubSub
```
$ docker run --rm --name my-pubsub -p 808 -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators pubsub start --host-port=0.0.0.0:808
```




### Cloud build configuration
- Encrpyted your SSH key for github clone by creating keyring name `builder-git` and key name `github`
- You need to grant `Cloud stroage Writer, Viewer` and `KMS Decrpytor` permission to cloudbuild service account