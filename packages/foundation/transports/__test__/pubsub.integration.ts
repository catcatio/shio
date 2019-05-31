import { CloudPubsubMessageChannelTransport } from '../pubsub'
import { createCloudPubSubInstance, WithPubsubEndpoint, WithPubsubProjectId } from '../../pubsub'
import { randomIncomingMessage, randomFollowMessageIntent } from '../../entities/__test__/random'
import { IncomingMessage } from '../../entities'
import { GetEnvString } from '../../env'
import { platform } from 'os'

describe('Test CloudPubsub', () => {
  let pubsub: CloudPubsubMessageChannelTransport
  beforeAll(async () => {
    if (GetEnvString('FOUNDATION_INTEGRATION_DEBUG') === '1') {
      jest.setTimeout(60 * 1000)
    }

    let host: string = ''
    if (platform() === 'darwin') {
      host = 'http://host.docker.internal:8080'
    } else {
      host = 'http://localhost:8080'
    }

    const cloudpubsub = await createCloudPubSubInstance(WithPubsubEndpoint('http://localhost:8085'), WithPubsubProjectId('catcat-local'))
    pubsub = new CloudPubsubMessageChannelTransport({
      host,
      pubsub: cloudpubsub,
      serviceName: 'integration-test'
    })

    // Clear the subscription channel
    // for testing (message in queue should be empty)
    await pubsub.purge()
    await pubsub.prepareTopic()
    pubsub.start()
  })
  test('Incoming publish and subscribe', async () => {
    const incomingMessage = randomIncomingMessage(randomFollowMessageIntent())
    const subscriptionChannel = jest.fn()

    // Try to subscribe and publish message to topic
    await Promise.all([
      new Promise((resolve, reject) => {
        pubsub.SubscribeIncommingMessage((message: IncomingMessage, ack: () => void) => {
          ack()
          subscriptionChannel(message)
          resolve()
        })
      }),
      pubsub.PublishIncommingMessage(incomingMessage)
    ])

    expect(subscriptionChannel).toBeCalledTimes(1)
    expect(subscriptionChannel).toHaveBeenCalledWith({
      ...incomingMessage,
      origin: expect.anything()
    })
  })

  afterAll(async () => {
    await pubsub.stop()
  })
})
