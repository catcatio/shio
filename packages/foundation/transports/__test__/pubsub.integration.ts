import { CloudPubsubTransport } from '../pubsub'
import { createCloudPubSubInstance, WithPubsubEndpoint, WithPubsubProjectId } from '../../pubsub'
import { randomIncomingMessage, randomFollowMessageIntent } from '../../entities/__test__/random'
import { IncomingMessage } from '../../entities'

describe('Test CloudPubsub', () => {
  test('Incoming publish and subscribe', async () => {

    const cloudpubsub = createCloudPubSubInstance(WithPubsubEndpoint('http://localhost:8085'), WithPubsubProjectId('catcat-local'))
    const pubsub = new CloudPubsubTransport(cloudpubsub, 'integration-test')

    // Clear the subscription channel
    // for testing (message in queue should be empty)
    await pubsub.purge()
    await pubsub.prepare()

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
    pubsub.UnsubscribeAllIncomingMessage()
    pubsub.UnsubscribeAllOutgoingMessage()

    expect(subscriptionChannel).toBeCalledTimes(1)
    expect(subscriptionChannel).toHaveBeenCalledWith({
      ...incomingMessage,
      origin: expect.anything()
    })

  })
})
