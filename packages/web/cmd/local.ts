import { bootstrap } from '../app/bootstrap'
import { Configurations } from '../app/types'
import { FileStorage, LocalFileStorage } from '@shio-bot/foundation'

async function loadConfig(storage: FileStorage, path: string): Promise<Configurations> {
  return await storage.GetJSONObject<Configurations>(path)
}

async function run() {
  let storage = new LocalFileStorage(process.cwd())
  let config = await loadConfig(storage, 'credentials/config.local.json')
  await bootstrap(config)
}

run()
