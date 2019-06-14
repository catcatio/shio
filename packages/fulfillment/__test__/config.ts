import { Config } from '../app'
import { platform } from 'os'
import { newLogger, GetEnvConfig } from '@shio-bot/foundation'


const log = newLogger()
const env = GetEnvConfig()
export default {
  datastoreEndpoint: 'http://localhost:5545',
  datastoreNamespace: 'fulfillment-integration',
  projectId: 'catcat-integration',
  pubsubEndpoint: 'http://localhost:8085',
  host: env.host,
  port: '8080'
} as Config
