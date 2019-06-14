import { Config } from '../app/config'
import { newLogger, GetEnvConfig } from '@shio-bot/foundation'
import { bootstrap } from '../app'

export function LoadConfig(): Config {
  const envConfig = GetEnvConfig()

  const option: Config = {
    ...envConfig,
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
