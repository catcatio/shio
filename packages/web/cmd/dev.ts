import { bootstrap } from '../app/bootstrap'
import { Configurations } from '../app/types'

function loadConfig(): Configurations {
  let config: Configurations = {
    serviceName: 'shio-api-dev',
    host: 'http://localhost',
    port: 3000,
    chatEngine: {
      line: {
        clientConfig: {
          channelAccessToken: 'dev_channel_access_token',
          channelSecret: 'dev_channel_secret',
          channelId: 'dev_channel_id'
        },
        sendToConsole: true
      },
      fluke: {
        intentMap: {
          'I am 15 year old.': {
            name: 'user.age',
            parameters: {
              age: 15
            }
          },
          unknown: msg => ({
            name: 'input.unknown',
            parameters: {
              message: msg
            }
          })
        }
      }
    },
    pubsub: {
      devPubSub: true
    },
    intentProvider: 'fluke'
  }

  return config
}

async function run() {
  let config = loadConfig()
  await bootstrap(config)
}

run()
