import { Config } from '../app/config'
import { GetEnvStringOrThrow, GetEnvString } from '@shio-bot/foundation'
import { bootstrap } from '../app'
import { createServer } from 'http';

export function LoadConfig(): Config {
  const option: Config = {
    projectId: GetEnvStringOrThrow('SHIO_FULFILLMENT_PROJECT_ID'),
    datastoreNamespace: GetEnvStringOrThrow('SHIO_FULFILLMENT_DATASTORE_NAMESPACE')
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
  await bootstrap({
    ...config,
    dev: false,
  })

  const server = createServer((req,res) => {
    res.writeHead(200, {'Content-Type': "text/plain"})
    res.end('ok')
  })
  server.listen(8080)
}

run()
