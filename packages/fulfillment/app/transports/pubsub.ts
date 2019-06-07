import { MessageChannelTransport, newLogger } from '@shio-bot/foundation'
import { FulfillmentEndpoint } from '../endpoints'
import { createOutgoingFromIncomingMessage, OutgoingMessage, ListItemEventMessageIntentKind } from '@shio-bot/foundation/entities'
import { newGlobalError, ErrorType } from '../entities/error';

export function registerPubsub(pubsub: MessageChannelTransport, endpoints: FulfillmentEndpoint) {
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

      const endpoint = endpoints[message.intent.name](message)
      if (!endpoint) {
        throw newGlobalError(ErrorType.NotFound, "intent fultillment not found")
      }
      outgoingMessage = await endpoint(message)
      ack()

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
