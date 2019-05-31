import { CloudPubsubMessageChannelTransport } from '../pubsub'
import { createCloudPubSubInstance, WithPubsubEndpoint, WithPubsubProjectId } from '../../pubsub'
import { randomIncomingMessage, randomFollowMessageIntent, randomOutgoingMessage, randomFollowMessageFulfillment } from '../../entities/__test__/random'
import { IncomingMessage } from '../../entities'
import { GetEnvString } from '../../env'
import { platform } from 'os'
import { atoi } from '../../type-utilities'

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
    await pubsub.purge()

    // Create topic that need for
    // Transport messageing
    await pubsub.prepareTopic()

    // start pubsub server
    // to receive push message
    const serverHost = new URL(host)
    pubsub.start(atoi(serverHost.port))
  })

  test('Incoming publish and subscribe', async () => {
    const incomingMessage = randomIncomingMessage(randomFollowMessageIntent())
    const subscriptionChannel = jest.fn()

    // Try to subscribe and publish message to topic
    // Set both subscription push endpoint to this instance
    // THIS MUST DO IN MIGRATION SCRIPT OR CONFIG IT BY HAND
    // DO NOT CALL THIS FUNCTION ON SERVICE
    await pubsub.createIncomingSubscriptionConfig(host)

    // Send new incoming message to IncomingMesageTopic
    await pubsub.PublishIncommingMessage(incomingMessage)

    // register incoming message handler
    // to pubsub transport (http://localhost:8080/incoming)
    await new Promise((resolve, reject) => {
      pubsub.SubscribeIncommingMessage((message: IncomingMessage, ack: () => void) => {
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
    await pubsub.createOutgoingSubscriptionConfig(host)

    // begin publish message
    const outgoingMessage = randomOutgoingMessage(randomFollowMessageFulfillment())
    const subscriptionChannel = jest.fn()

    await pubsub.PublishOutgoingMessage(outgoingMessage)
    await new Promise((resolve, reject) => {
      pubsub.SubscribeOutgoingMessage((message, ack) => {
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
    await pubsub.stop()
  })
})
