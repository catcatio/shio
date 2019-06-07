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
  WithPubsubProjectId
} from '@shio-bot/foundation'
import * as express from 'express'
import { Config } from './config'
import { createFulfillmentEndpoint } from './endpoints'
import { DatastoreACLRepository, DatastoreUserRepository } from './repositories'
import { registerPubsub } from './transports/pubsub'
import { DefaultBoardingUsecase } from './usecases/boarding'
import { DefaultMerchandiseUseCase } from './usecases/merchandise';
import { DatastoreAssetRepository } from './repositories/asset';

export async function bootstrap(config: Config) {
  const log = newLogger()

  log.info('Connecting to datastore....')
  const datastoreOptions = [WithDatastoreProjectId(config.projectId), WithDatastoreNameSpace(config.datastoreNamespace)]
  if (config.datastoreEndpoint) {
    datastoreOptions.push(WithDatastoreAPIEndpoint(config.datastoreEndpoint))
  }

  log.info('Connecting to pubsub....')
  const pubsubOptions: PubsubOption[] = [WithPubsubProjectId(config.projectId)]
  if (config.pubsubEndpoint) {
    pubsubOptions.push(WithPubsubEndpoint(config.pubsubEndpoint))
  }

  const datastore = await createDatastoreInstance(...datastoreOptions)
  const cloudpubsub = await createCloudPubSubInstance(...pubsubOptions)

  const acl = new DatastoreACLRepository(datastore)
  const pubsub = new CloudPubsubMessageChannelTransport({
    pubsub: cloudpubsub,
    serviceName: 'fulfillment'
  })

  log.info('prepare data....')
  await acl.prepare()
  log.info('starting up service component...')

  const assetRepository = new DatastoreAssetRepository(datastore)
  const userRepository = new DatastoreUserRepository(datastore)
  const boardingUsecase = new DefaultBoardingUsecase(userRepository, acl)
  const merchandiseUseCase = new DefaultMerchandiseUseCase(acl,userRepository,assetRepository)
  const endpoints = createFulfillmentEndpoint(boardingUsecase, merchandiseUseCase)
  log.info("🎉 endpoint intial!")

  log.info('registry pubsub...')
  registerPubsub(pubsub, endpoints)
  log.info("🎉 pubsub transport registered!")

  const app = express()
  app.use(express.json())
  app.use('/', pubsub.messageRouter)
  app.get('/', (_, res) => res.status(200).send('ok'))
  log.info(`start server on port ${config.port}`)
  const server = app.listen(atoi(config.port))

  return {
    close: async () => {
      log.info('gracefully shutting down service....')
      pubsub.UnsubscribeAllIncomingMessage()
      pubsub.UnsubscribeAllOutgoingMessage()
      await new Promise(resolve => {
        server.close(() => {
          log.info('server is shutdown')
          resolve()
        })
      })

      log.info('Service is shutdown!!')
    },
    pubsub,
  }
}
