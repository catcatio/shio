import { MessageChannelTransport, newLogger } from '@shio-bot/foundation'
import { FulfillmentEndpoint } from '../endpoints'
import { createOutgoingFromIncomingMessage, OutgoingMessage } from '@shio-bot/foundation/entities'

export function registerPubsub(pubsub: MessageChannelTransport, endpoint: FulfillmentEndpoint) {
  const log = newLogger()

  pubsub.SubscribeIncommingMessage(async (message, ack) => {
    log
    .withRequestId(message.requestId)
    .withProviderName(message.provider)
    .withUserId(message.source.userId)
    .withFields({
      intent: message.intent.name,
      type: message.source.type
    })
    .info(`incoming message begin process...`)
    let outgoingMessage: OutgoingMessage | void
    try {
      switch (message.intent.name) {
        case 'follow':
          outgoingMessage = await endpoint.follow(message)
          ack()
          break
        default:
          ack()
          break
      }

      // Send outgoing message
      if (outgoingMessage) {
        await pubsub.PublishOutgoingMessage(outgoingMessage)
      }

    } catch (e) {
      await pubsub.PublishOutgoingMessage(
        createOutgoingFromIncomingMessage(message, {
          name: 'error',
          parameters: {
            reason: JSON.stringify(e)
          }
        })
      )
      ack()
    }
  })
}
