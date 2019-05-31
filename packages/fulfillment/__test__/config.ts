import { Config } from '../app'
import { platform } from 'os'
import { newLogger } from '@shio-bot/foundation'

const getHostForIntegrationTest = () => {
let host = 'http://localhost'
  if (platform() === 'darwin') {
    log.info('Setup subscription for darwin platform')
    host = 'http://host.docker.internal'
  } else {
    log.info('Setup subscription none darwin platform')
    host = 'http://localhost'
  }
  return host
}

const log = newLogger()
export default {
  datastoreEndpoint: 'http://localhost:5545',
  datastoreNamespace: 'catcat',
  projectId: 'catcat-local',
  pubsubEndpoint: 'http://localhost:8085',
  host: getHostForIntegrationTest() + ":8080",
  port: '8080'
} as Config
