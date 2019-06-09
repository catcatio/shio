import { Config } from '../app/config'
import { GetEnvStringOrThrow, GetEnvString, newLogger } from '@shio-bot/foundation'
import { bootstrap, getFulfillmentDevelopmentConstant } from '../app'

export function LoadConfig(): Config {
  const defaultConstant = getFulfillmentDevelopmentConstant()

  const option: Config = {
    projectId: GetEnvString('SHIO_FULFILLMENT_PROJECT_ID',defaultConstant.projectId),
    datastoreNamespace: GetEnvString('SHIO_FULFILLMENT_DATASTORE_NAMESPACE', defaultConstant.datastoreNamespace),
    host: GetEnvStringOrThrow('SHIO_FULFILLMENT_HOST'),
    port: GetEnvStringOrThrow('PORT'),
  }
  if (GetEnvString('SHIO_FULFILLMENT_DATASTORE_LOCAL') === '1') {
    option.datastoreEndpoint = 'http://localhost:5445'
  }

  if (GetEnvString('SHIO_FULFILLMENT_PUBSUB_LOCAL') === '1') {
    option.pubsubEndpoint = 'http://localhost:8085'
  }

  return option
}

async function run() {
  const config = LoadConfig()
  const log = newLogger()
  log.info("init shio fulfillment service....")
  const service = await bootstrap({
    ...config,
    dev: false,
  })
  log.info('service is ready!!')

  process.on('beforeExit', () => {
    service.close().then()
  })
}

run()
