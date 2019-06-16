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
        sendToConsole: true,
        liff: {
          viewAsset: "http://localhost:3000/view/asset",
          viewProfile: "http://localhost/view/profile"
        }
      },
      fluke: {
        intentMap: {
          'I am 15 year old.': {
            name: 'user.age',
            parameters: {
              age: 15
            }
          },
          'purchase book': {
            name: 'purchase-item',
            parameters: {
              merchantTitle: 'WOW!!!!'
            }
          },
          unknown: msg => ({
            name: 'input.unknown',
            parameters: {
              message: msg
            }
          })
        }
      },
      linepay: {
        clientConfig: {
          channelId: 'string',
          channelSecret: 'string',
          isSandbox: true
        },
        // apiEndpoint: 'string',
        confirmUrl: 'string'
      }
    },
    pubsub: {
      cloudPubSub: {
        apiEndpoint: 'http://localhost:8085',
        projectId: 'catcat-local'
      },
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
