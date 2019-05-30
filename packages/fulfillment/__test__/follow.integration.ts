import { randomFollowMessageIntent, randomIncomingMessage } from '@shio-bot/foundation/entities/__test__/random'
import { createPubsubIntegrationClient, expectFulfillment } from './pubsub';

describe('Follow intent test', () => {

  let pubsub: ReturnType<typeof createPubsubIntegrationClient>


  beforeAll(() => {
    pubsub = createPubsubIntegrationClient()
  })

  test('Create new user', async () => {
    const incomingMessage = randomIncomingMessage(randomFollowMessageIntent())
    let message = await pubsub.sendIncomingMessage(incomingMessage)
    expect(message.source.userId).toEqual(incomingMessage.source.userId)
    expectFulfillment('follow', (fulfillment) => {
      expect(fulfillment.parameters.isCompleted).toBeTruthy()
      expect(fulfillment.parameters.userId).toBeDefined()
      expect(fulfillment.parameters.chatSessionId).toBeDefined()
    })(message)

    message = await pubsub.sendIncomingMessage(incomingMessage)
    expect(message.source.userId).toEqual(incomingMessage.source.userId)
    expectFulfillment('follow', (fulfillment) => {
      expect(fulfillment.parameters.isCompleted).toBeFalsy()
      expect(fulfillment.parameters.userId).toBeUndefined()
      expect(fulfillment.parameters.chatSessionId).toBeUndefined()
    })(message)

  })


  afterAll(() => {
    pubsub.clean()
  })
})

