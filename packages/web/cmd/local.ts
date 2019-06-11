import { bootstrap } from '../app/bootstrap'
import { Configurations } from '../app/types'
import { FileStorage, LocalFileStorage } from '@shio-bot/foundation'
import { platform } from 'os'
import { newLogger } from '@shio-bot/foundation'

const log = newLogger()

const getHostForIntegrationTest = () => {
  let host = 'http://localhost:3000'
  if (platform() === 'darwin') {
    log.info('Setup subscription for darwin platform')
    host = 'http://host.docker.internal:3000'
  } else {
    log.info('Setup subscription none darwin platform')
    host = 'http://localhost:3000'
  }
  return host
}

async function loadConfig(storage: FileStorage, path: string): Promise<Configurations> {
  return await storage.GetJSONObject<Configurations>(path)
}

async function run() {
  let storage = new LocalFileStorage(process.cwd())
  let config = await loadConfig(storage, 'credentials/config.local.json')
  let host = getHostForIntegrationTest()
  config.host = host
  await bootstrap(config)
}

run()
