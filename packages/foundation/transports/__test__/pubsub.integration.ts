import { CloudPubsubMessageChannelTransport } from '../pubsub/message'
import { createCloudPubSubInstance, WithPubsubEndpoint, WithPubsubProjectId } from '../../pubsub'
import { randomIncomingMessage, randomFollowMessageIntent, randomOutgoingMessage, randomFollowMessageFulfillment } from '../../entities/__test__/random'
import { IncomingMessage } from '../../entities'
import { GetEnvString } from '../../env'
import { platform } from 'os'
import { atoi } from '../../type-utilities'
import * as express from 'express'
import { Server } from 'http'

// Because docker network in Macos and Linux
// using different config to reach localhost
let host: string = ''
if (platform() === 'darwin') {
  host = 'http://host.docker.internal:8890'
} else {
  host = 'http://localhost:8890'
}

describe('CloudPubsub messageing transports integration testing', () => {
  let pubsub: CloudPubsubMessageChannelTransport
  let server: Server
  beforeAll(async () => {
    if (GetEnvString('FOUNDATION_INTEGRATION_DEBUG') === '1') {
      jest.setTimeout(60 * 1000)
    }

    // Create pubsub connect to local pubsub server
    // ATTEND: this endpoint must be in local development or development project
    // because subscription of topic will be deleted
    const cloudpubsub = await createCloudPubSubInstance(WithPubsubEndpoint('http://localhost:8085'), WithPubsubProjectId('catcat-local'))

    pubsub = new CloudPubsubMessageChannelTransport({
      pubsub: cloudpubsub,
      serviceName: 'integration-test'
    })

    // Clear the subscription channel
    // for testing (message in queue should be empty)
    await pubsub.Purge()

    // Create topic that need for
    // Transport messageing
    await pubsub.PrepareTopic()

    // start server
    // to receive push message
    const serverHost = new URL(host)

    const app = express()
    app.use(express.json())
    app.use('/', pubsub.NotificationRouter)
    app.get('/', (req, res) => res.status(200).send('ok'))
    server = app.listen(atoi(serverHost.port), () => {
      console.log('test server started ', serverHost.port)
    })
  })

  test('Incoming publish and subscribe', async () => {
    const incomingMessage = randomIncomingMessage(randomFollowMessageIntent())
    const subscriptionChannel = jest.fn()

    // Try to subscribe and publish message to topic
    // Set both subscription push endpoint to this instance
    // THIS MUST DO IN MIGRATION SCRIPT OR CONFIG IT BY HAND
    // DO NOT CALL THIS FUNCTION ON SERVICE
    await pubsub.CreateIncomingSubscriptionConfig(host)

    // Send new incoming message to IncomingMesageTopic
    await pubsub.PublishIncoming(incomingMessage)

    // register incoming message handler
    // to pubsub transport (http://localhost:8080/incoming)
    await new Promise((resolve, reject) => {
      pubsub.SubscribeIncoming((message: IncomingMessage, ack: () => void) => {
        ack()
        subscriptionChannel(message)
        resolve()
      })
    })

    expect(subscriptionChannel).toBeCalledTimes(1)
    expect(subscriptionChannel).toHaveBeenCalledWith({
      ...incomingMessage,
      origin: expect.anything()
    })
  })

  test('Outgoing publish and subscription', async () => {
    // THIS MUST DO IN MIGRATION SCRIPT OR CONFIG IT BY HAND
    // DO NOT CALL THIS FUNCTION ON SERVICE
    await pubsub.CreateOutgoingSubscriptionConfig(host)

    // begin publish message
    const outgoingMessage = randomOutgoingMessage(randomFollowMessageFulfillment())
    const subscriptionChannel = jest.fn()

    await pubsub.PublishOutgoing(outgoingMessage)
    await new Promise((resolve, reject) => {
      pubsub.SubscribeOutgoing((message, ack) => {
        subscriptionChannel(message)
        resolve(message)
        ack()
      })
    })

    expect(subscriptionChannel).toBeCalledTimes(1)
    expect(subscriptionChannel).toHaveBeenCalledWith({
      ...outgoingMessage,
      origin: expect.anything()
    })
  })

  afterAll(async () => {
    await new Promise(resolve => {
      server.close(() => {
        resolve()
      })
    })
  })
})
