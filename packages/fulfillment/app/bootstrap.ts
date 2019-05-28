import { Config } from './config'
import { DatastoreACLRepository, DatastoreUserRepository } from './repositories'
import {
  createDatastoreInstance,
  WithDatastoreProjectId,
  WithDatastoreNameSpace,
  WithDatastoreAPIEndpoint,
  WithPubsubEndpoint,
  PubsubOption,
  CloudPubsubTransports,
  newLogger,
  createCloudPubSubInstance,
  WithPubsubProjectId
} from '@shio/foundation'
import { DefaultBoardingUsecase } from './usecases/boarding'
import { registerPubsub } from './transports/pubsub'
import { prepare } from './prepare';

export async function bootstrap(config: Config) {

  const log = newLogger()

  log.info('Connecting to datastore....')
  const datastoreOptions = [WithDatastoreProjectId(config.projectId), WithDatastoreNameSpace(config.datastoreNamespace)]
  if (config.datastoreEndpoint) {
    datastoreOptions.push(WithDatastoreAPIEndpoint(config.datastoreEndpoint))
  }

  log.info('Connecting to pubsub....')
  const pubsubOptions: PubsubOption[] = [
    WithPubsubProjectId(config.projectId)
  ]
  if (config.pubsubEndpoint) {
    pubsubOptions.push(
      WithPubsubEndpoint(config.pubsubEndpoint)
    )
  }

  const datastore = await createDatastoreInstance(...datastoreOptions)
  const cloudpubsub = createCloudPubSubInstance(...pubsubOptions)

  const acl = new DatastoreACLRepository(datastore)
  const pubsub = new CloudPubsubTransports(cloudpubsub, 'fulfillment')

  log.info('prepare data....')
  await acl.prepare()
  await pubsub.prepare()
  log.info('starting up service component...')

  const userRepository = new DatastoreUserRepository(datastore)
  const boardingUsecase = new DefaultBoardingUsecase(userRepository, acl)

  log.info('registry pubsub...')
  registerPubsub(pubsub, boardingUsecase)
}
