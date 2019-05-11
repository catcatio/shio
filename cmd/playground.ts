import { Permission, newResourceTag, SYSTEM_USER } from '../app/entities'
import { DatastoreUserRepository, WithSystemOperation, WithWhere, DatastoreACLRepository, RunDatastoreMigration, RunCloudPubSubMigration } from '../app/repositories'
import { CreateCloudPubSubInstance, CreateDatastoreInstance } from '../app/tools'
import { CloudPubSubMessageRepository } from '../app/repositories/message'

// if you want to use local development datastore server
// insert datastore endpoint to CrateDatastoreInstance
// example
// CraeteDatastoreInstance("http://localhost:8081")

// For local development
// leave it blank if you want to connect to Gcloud Datastore (require gcloud sdk cli with login)
// and use command
// `$ gcloud beta emulators datastore start`
// const datastore = CreateDatastoreInstance( 'http://localhost:8081')
// For remote development
const datastore = CreateDatastoreInstance()

// For local development
// Run `gcloud beta emulators pubsub start`
// const pubsub = CreateCloudPubSubInstance('http://localhost:8085')
// For remote development
const pubsub = CreateCloudPubSubInstance()

async function Run() {
  // Please cleanup after commit
  // if anything exists in this function
  // you can delete it without asking anyone

  const aclrepo = new DatastoreACLRepository(datastore)
  const userRepo = new DatastoreUserRepository(datastore)
  const messageRepo = new CloudPubSubMessageRepository(pubsub, aclrepo)

  console.time('execution time')
  await RunDatastoreMigration(datastore, aclrepo)
  await RunCloudPubSubMigration(pubsub)

  console.timeEnd('execution time')
}
Run()
