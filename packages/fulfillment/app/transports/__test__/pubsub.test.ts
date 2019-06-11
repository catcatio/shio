import { FulfillmentEndpoint } from '../../endpoints'
import { registerPubsub } from '../pubsub'
import { __mock__CloudPubsubMessageTransports } from '@shio-bot/foundation/transports/__test__/mock'
import { randomIncomingMessage, randomFollowMessageIntent } from '@shio-bot/foundation/entities/__test__/random'
import { ListItemEventMessageIntentKind, FollowEventMessageIntentKind, GetItemDownloadUrlEventMessageIntentKind, WhoMessageIntentKind, UnfollowEventMessageIntentKind } from '../../entities/asset'

describe('Pubsub transport test', () => {
  const mockEndpoints: FulfillmentEndpoint = {
    [ListItemEventMessageIntentKind]: jest.fn(),
    [GetItemDownloadUrlEventMessageIntentKind]: jest.fn(),
    [WhoMessageIntentKind]: jest.fn(),
    [FollowEventMessageIntentKind]: jest.fn(),
    [UnfollowEventMessageIntentKind]: jest.fn()
  }
  let pubsub: __mock__CloudPubsubMessageTransports

  beforeAll(async () => {
    pubsub = new __mock__CloudPubsubMessageTransports()
  })
  test('Incoming message follow', async () => {
    registerPubsub(pubsub, mockEndpoints)
    const message = randomIncomingMessage(randomFollowMessageIntent())
    await pubsub.PublishIncoming(message)
    expect(pubsub.ack).toBeCalledTimes(1)
    expect(mockEndpoints.follow).toBeCalledTimes(1)
  })
})
