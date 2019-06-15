
import { bootstrap } from '../server'
import { GetEnvConfig, GetEnvString } from '@shio-bot/foundation';

async function run() {
  const config = GetEnvConfig()
  await bootstrap(GetEnvString("SHIO_FULFILLMENT_ENDPOINT", 'http://fulfillment-dot-catcat-development.appspot.com'), config.port, config.host)
}

run()