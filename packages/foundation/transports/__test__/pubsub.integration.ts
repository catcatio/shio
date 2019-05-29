import { createCloudPubSubInstance, WithPubsubEndpoint, WithPubsubProjectId } from '../../pubsub'
import { CloudPubsubTransports } from '../pubsub'
import { randomIncomingMessage, randomFollowMessageIntent } from '../../entities/__test__/random';

describe('Pubsub transport test', () => {
  test('Incoming channel', async () => {
    const cloudpubsub = createCloudPubSubInstance(WithPubsubProjectId('catcat-local'), WithPubsubEndpoint('http://localhost:8085'))
    const callThisFnIfMessageIsComing = jest.fn()
    await new Promise(async (resolve, reject) => {
      const pubsub = new CloudPubsubTransports(cloudpubsub, 'test')
      await pubsub.prepare()
      pubsub.SubscribeIncommingMessage(async (message, m) => {
        callThisFnIfMessageIsComing(message)
        m()
        pubsub.UnsubscribeAllIncomingMessage()
        resolve()
      })
      await pubsub.PublishIncommingMessage(randomIncomingMessage(randomFollowMessageIntent()))
    })
    expect(callThisFnIfMessageIsComing).toBeCalledTimes(1)
  })
})
