import { bootstrap } from '../app/bootstrap'
import { Configurations } from '../app/types'
import { FileStorage, GCPFileStorage, GetEnvStringOrThrow, atoi } from '@shio-bot/foundation'

async function loadConfig(storage: FileStorage, path: string): Promise<Configurations> {
  return await storage.GetJSONObject<Configurations>(path)
}

async function run() {
  let projectId = GetEnvStringOrThrow('SHIO_API_PROJECT_ID')
  let bucket = GetEnvStringOrThrow('SHIO_API_BUCKET')
  let path = GetEnvStringOrThrow('SHIO_API_CONFIG_PATH')
  let port = GetEnvStringOrThrow('PORT')

  let storage = new GCPFileStorage(bucket, { projectId })
  let config = await loadConfig(storage, path)
  config.port = atoi(port)

  await bootstrap(config)
}

run()
