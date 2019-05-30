import { FulfillmentEndpoint } from '../../endpoints'
import { registerPubsub } from '../pubsub'
import { __mock__CloudPubsubTransports } from '@shio-bot/foundation/transports/__test__/mock'
import { randomIncomingMessage, randomFollowMessageIntent } from '@shio-bot/foundation/entities/__test__/random';

describe('Pubsub transport test', () => {
  const mockEndpoints: FulfillmentEndpoint = {
    follow: jest.fn()
  }
  let pubsub: __mock__CloudPubsubTransports

  beforeAll(async () => {
    pubsub = new __mock__CloudPubsubTransports()
  })
  test('Incoming message follow', async () => {
    registerPubsub(pubsub, mockEndpoints)
    const message = randomIncomingMessage(randomFollowMessageIntent())
    await pubsub.PublishIncommingMessage(message)
    expect(pubsub.ack).toBeCalledTimes(1)
    expect(mockEndpoints.follow).toBeCalledTimes(1)

  })
})
