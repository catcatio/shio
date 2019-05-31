



## Monorepository cheatsheet
```

```


## Development local with GCloud service emulator
### CloudDatastore
```
$ docker run  -d --name shio-datastore -p 5545:5545 -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators datastore start --host-port=0.0.0.0:5545
```

### CloudPubSub
```
$ docker run --rm -p 8085:8085 --name shio-pubsub -e CLOUDSDK_CORE_PROJECT=test gcr.io/cloud-builders/gcloud beta emulators pubsub start --host-port=0.0.0.0:8085
```

### Cloud build configuration
- Encrpyted your SSH key for github clone by creating keyring name `builder-git` and key name `github`
  ```
    ## Generate rsa key
    ssh-keygen 
    gcloud kms keyrings create builder-git --location=global
    gcloud kms keys create github --location=global --keyring=builder-git --purpose=encryption
    ### CREATE YOUR NEW RSA KEY ###
    gcloud kms encrypt --plaintext-file ./<KEY_NAME> --ciphertext-file ./<ENCRYPED_KEY_NAME>.enc --location=global --keyring=builder-git --key=github
    ### you will retreive .enc file
  ```
- You need to grant `Cloud stroage Writer, Viewer` and `KMS Decrpytor` permission to cloudbuild service account

### Trigger cloud build
```
## node_modules yarn cache
gcloud builds submit --config ./cloudbuild.node_modules.yaml

## Run pipeline include unit and integration test of each package
gcloud builds submit --config ./cloudbuild.yaml
```