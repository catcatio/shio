import { randomFollowMessageIntent, randomIncomingMessage } from '@shio-bot/foundation/entities/__test__/random'
import { createPubsubIntegrationClient, expectFulfillment } from './pubsub'
import { UnPromise } from '../app/entities'
import { isFulfillmentOfKind, FollowEventMessageFulfillmentKind } from '@shio-bot/foundation/entities';

describe('Follow intent test', () => {
  let outgoingPubsub: UnPromise<ReturnType<typeof createPubsubIntegrationClient>>

  jest.setTimeout(60 * 1000)

  beforeAll(async () => {
    outgoingPubsub = await createPubsubIntegrationClient()
    await outgoingPubsub.start()
  })

  test('Create new user', async () => {
    const incomingMessage = randomIncomingMessage(randomFollowMessageIntent())
    let message = await outgoingPubsub.sendIncomingMessage(incomingMessage)

    if (isFulfillmentOfKind(FollowEventMessageFulfillmentKind, message)) {
      expect(message.source!.userId).toEqual(incomingMessage.source.userId)
      message = await outgoingPubsub.sendIncomingMessage(incomingMessage)
      expect(message.source!.userId).toEqual(incomingMessage.source.userId)
    }
  })

  afterAll(async () => {
    await outgoingPubsub.clean()
  })
})
