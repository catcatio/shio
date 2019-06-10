import { DatastoreUserRepository, WithSystemOperation, DatastoreACLRepository } from '../app/repositories'
import {
  createDatastoreInstance,
  createCloudPubSubInstance,
  CloudPubsubMessageChannelTransport,
  WithDatastoreAPIEndpoint,
  WithPubsubEndpoint,
  WithPubsubProjectId,
  WithDatastoreProjectId
} from '@shio-bot/foundation'
import * as uuid from 'uuid/v4'
import * as express from 'express'

// if you want to use local development datastore server
// insert datastore endpoint to CrateDatastoreInstance
// example
// CraeteDatastoreInstance("http://localhost:5545")

async function init() {
  // # CloudDatastore
  // ## For local development
  // leave it blank if you want to connect to Gcloud Datastore (require gcloud sdk cli with login)
  // and use command
  // `$ gcloud beta emulators datastore start`
  const datastore = await createDatastoreInstance(WithDatastoreProjectId('catcat-local'), WithDatastoreAPIEndpoint('http://localhost:5545'))
  // ## For remote development
  // const datastore = await createDatastoreInstance()

  // # CloudPubsub
  // ## For local development
  // Run `gcloud beta emulators pubsub start`
  const pubsub = await createCloudPubSubInstance(WithPubsubProjectId('catcat-local'), WithPubsubEndpoint('http://localhost:8085'))
  // ## For remote development
  // const pubsub = await createCloudPubSubInstance()
  return { datastore, pubsub }
}

async function Run() {
  const host = 'http://host.docker.internal:8080'
  const { pubsub, datastore } = await init()
  const cloudpubsub = new CloudPubsubMessageChannelTransport({
    pubsub,
    serviceName: 'playground'
  })
  await cloudpubsub.PrepareTopic()
  const [subs] = await cloudpubsub.incomingChannel.topic.getSubscriptions()

  await Promise.all(
    subs.map(async sub => {
      console.log(sub.name)
      const meta = await sub.getMetadata()
      console.log(meta)
    })
  )

  const app = express()
  app.use(express.json())
  app.use('/', cloudpubsub.NotificationRouter)
  app.get('/', (req, res) => res.status(200).send('ok'))
  let server = app.listen(8080, () => {
    console.log('test server started ', 8080)
  })

  cloudpubsub.SubscribeIncoming(async (message, ack) => {
    console.log(message)
    ack()
  })

  cloudpubsub.SubscribeOutgoing(async (message, ack) => {
    console.log(message)
    ack()
  })

  await cloudpubsub.PublishIncoming({
    intent: {
      name: 'follow',
      parameters: {
        displayName: 'AIM'
      }
    },
    languageCode: 'th',
    provider: 'line',
    source: {
      userId: uuid().toString(),
      type: 'user'
    },
    userProfile: {
      userId: uuid().toString(),
      displayName: `i am ${uuid().toString()}`
    },
    timestamp: Date.now(),
    type: 'follow',
    original: {},
    requestId: ''
  })

  // Please cleanup after commit
  // if anything exists in this function
  // you can delete it without asking anyone
}
Run()
