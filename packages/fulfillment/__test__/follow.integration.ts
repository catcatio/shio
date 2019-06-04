import { randomFollowMessageIntent, randomIncomingMessage } from '@shio-bot/foundation/entities/__test__/random'
import { createPubsubIntegrationClient, expectFulfillment } from './pubsub'
import { UnPromise } from '../app/entities'

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

    expect(message.source.userId).toEqual(incomingMessage.source.userId)
    expectFulfillment('follow', fulfillment => {
      expect(fulfillment.parameters.isCompleted).toBeTruthy()
      expect(fulfillment.parameters.userId).toBeDefined()
      expect(fulfillment.parameters.chatSessionId).toBeDefined()
    })(message)

    message = await outgoingPubsub.sendIncomingMessage(incomingMessage)
    expect(message.source.userId).toEqual(incomingMessage.source.userId)
    expectFulfillment('follow', fulfillment => {
      expect(fulfillment.parameters.isCompleted).toBeFalsy()
      expect(fulfillment.parameters.userId).toBeUndefined()
      expect(fulfillment.parameters.chatSessionId).toBeUndefined()
    })(message)
  })

  afterAll(async () => {
    await outgoingPubsub.clean()
  })
})
