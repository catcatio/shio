import { bootstrap } from '../app'

async function run() {
  const host = 'http://localhost:8080'
  await bootstrap({
    datastoreEndpoint: 'http://localhost:5545',
    datastoreNamespace: 'catcat',
    projectId: 'catcat-local',
    pubsubEndpoint: 'http://localhost:8085',
    host,
    port: "8080"
  })
}

run()
