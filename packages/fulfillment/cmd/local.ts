import { bootstrap } from '../app'

async function run() {
  const host = 'http://host.docker.internal:8080'
  const service = await bootstrap({
    datastoreEndpoint: 'http://localhost:5545',
    datastoreNamespace: 'catcat',
    projectId: 'catcat-local',
    pubsubEndpoint: 'http://localhost:8085',
    host,
    port: '8080',
    dev: true
  })

  process.on('beforeExit', () => {
    service.close().then()
  })
}

run()
