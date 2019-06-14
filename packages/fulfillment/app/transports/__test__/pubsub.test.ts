import { FulfillmentEndpoint } from '../../endpoints'
import { registerPubsub } from '../pubsub'
import { __mock__CloudPubsubMessageTransports, __mock__CloudPubsubPaymentTransports } from '@shio-bot/foundation/transports/__test__/mock'
import { randomIncomingMessage, randomFollowMessageIntent, randomPurchaseItemIntent } from '@shio-bot/foundation/entities/__test__/random'
import {
  ListItemEventMessageIntentKind,
  FollowEventMessageIntentKind,
  GetItemDownloadUrlEventMessageIntentKind,
  WhoMessageIntentKind,
  UnfollowEventMessageIntentKind,
  PurchaseItemEventMessageIntentKind,
  DescribeItemMessageIntentKind
} from '@shio-bot/foundation/entities'

describe('Pubsub transport test', () => {
  const mockEndpoints: FulfillmentEndpoint = {
    [DescribeItemMessageIntentKind]: jest.fn(),
    [ListItemEventMessageIntentKind]: jest.fn(),
    [GetItemDownloadUrlEventMessageIntentKind]: jest.fn(),
    [WhoMessageIntentKind]: jest.fn(),
    [FollowEventMessageIntentKind]: jest.fn(),
    [UnfollowEventMessageIntentKind]: jest.fn(),
    [PurchaseItemEventMessageIntentKind]: jest.fn()
  }
  let pubsub: __mock__CloudPubsubMessageTransports
  let paymentPubsub: __mock__CloudPubsubPaymentTransports

  beforeEach(async () => {
    pubsub = new __mock__CloudPubsubMessageTransports()
    paymentPubsub = new __mock__CloudPubsubPaymentTransports()
    registerPubsub(pubsub, paymentPubsub, mockEndpoints)
  })
  test('Incoming message follow', async () => {
    const message = randomIncomingMessage(randomFollowMessageIntent())
    await pubsub.PublishIncoming(message)
    expect(pubsub.ack).toBeCalledTimes(1)
    expect(mockEndpoints.follow).toBeCalledTimes(1)
  })

  test('reserve payment', async () => {
    const message = randomIncomingMessage(randomPurchaseItemIntent())
    await pubsub.PublishIncoming(message)
    expect(pubsub.ack).toBeCalledTimes(1)
    expect(mockEndpoints['purchase-item']).toBeCalledTimes(1)
  })
})
