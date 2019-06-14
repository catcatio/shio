import {
  atoi,
  CloudPubsubMessageChannelTransport,
  createCloudPubSubInstance,
  createDatastoreInstance,
  newLogger,
  PubsubOption,
  WithDatastoreAPIEndpoint,
  WithDatastoreNameSpace,
  WithDatastoreProjectId,
  WithPubsubEndpoint,
  WithPubsubProjectId,
  GCPFileStorage
} from '@shio-bot/foundation'
import * as express from 'express'
import { Config } from './config'
import { DefaultFulfillmentEndpoint } from './endpoints'
import { DatastoreACLRepository, DatastoreUserRepository } from './repositories'
import { registerPubsub } from './transports/pubsub'
import { DefaultBoardingUsecase } from './usecases/boarding'
import { CloudPubsubPaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'
import { DefaultMerchandiseUseCase } from './usecases/merchandise';
import { DatastoreAssetRepository } from './repositories/asset';
import { registerHttpTransports } from './transports/http';
import { DefaultInventoryUseCase } from './usecases/inventory';
import { createGCPFileStorage } from '@shio-bot/foundation/storage/gcp';

export async function bootstrap(config: Config) {
  const log = newLogger()

  log.info('Connecting to datastore....')
  const datastoreOptions = [
    WithDatastoreProjectId(config.projectId),
    WithDatastoreNameSpace(config.datastoreNamespace),
    WithDatastoreAPIEndpoint(config.datastoreEndpoint)
  ]

  log.info('Connecting to pubsub....')
  const pubsubOptions: PubsubOption[] = [
    WithPubsubProjectId(config.projectId),
    WithPubsubEndpoint(config.pubsubEndpoint)
  ]

  const datastore = await createDatastoreInstance(...datastoreOptions)
  const cloudpubsub = await createCloudPubSubInstance(...pubsubOptions)

  const storage = await createGCPFileStorage(config.bucketName)
  await storage.LoadKey()

  const acl = new DatastoreACLRepository(datastore)

  const messagePubsub = new CloudPubsubMessageChannelTransport({
    pubsub: cloudpubsub,
    serviceName: 'fulfillment'
  })

  const paymentPubsub = new CloudPubsubPaymentChannelTransport({
    pubsub: cloudpubsub,
    serviceName: 'fulfillment'
  })

  log.info('prepare data....')
  await acl.prepare()
  log.info('starting up service component...')

  const assetRepository = new DatastoreAssetRepository(datastore, storage)
  const userRepository = new DatastoreUserRepository(datastore)

  const inventoryUseCase = new DefaultInventoryUseCase(storage, assetRepository, acl)
  const boardingUsecase = new DefaultBoardingUsecase(userRepository, acl)
  const merchandiseUseCase = new DefaultMerchandiseUseCase(acl, userRepository, assetRepository)

  const endpoints = new DefaultFulfillmentEndpoint(boardingUsecase, merchandiseUseCase, inventoryUseCase)
  log.info("🎉 endpoint intial!")

  log.info('registry pubsub...')
  registerPubsub(messagePubsub, paymentPubsub, endpoints)
  log.info('🎉 pubsub transport registered!')

  const app = express()
  registerHttpTransports(app, endpoints)

  app.use(express.json())
  app.use('/', messagePubsub.NotificationRouter)
  app.use('/', paymentPubsub.NotificationRouter)
  app.get('/', (_, res) => res.status(200).send('ok'))
  log.info(`start server on port ${config.port}`)
  const server = app.listen(atoi(config.port))

  return {
    close: async () => {
      log.info('gracefully shutting down service....')
      messagePubsub.UnsubscribeAllIncomingMessage()
      messagePubsub.UnsubscribeAllOutgoingMessage()
      paymentPubsub.UnsubscribeAll()
      await new Promise(resolve => {
        server.close(() => {
          log.info('server is shutdown')
          resolve()
        })
      })

      log.info('Service is shutdown!!')
    },
    pubsub: messagePubsub
  }
}
