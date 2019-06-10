import { newLogger, MessageChannelTransport } from '@shio-bot/foundation'
import { FulfillmentEndpoint } from '../endpoints'
import { createOutgoingFromIncomingMessage, OutgoingMessage } from '@shio-bot/foundation/entities'
import { newGlobalError, ErrorType } from '../entities/error';

export function registerPubsub(pubsub: MessageChannelTransport, endpoints: FulfillmentEndpoint) {
  const log = newLogger()

  pubsub.SubscribeIncoming(async (message, ack) => {
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

      const endpoint = endpoints[message.intent.name]
      if (!endpoint) {
        throw newGlobalError(ErrorType.NotFound, "intent fultillment not found")
      }

      // do task and resolve
      // outoging message
      outgoingMessage = await endpoint(message)

      ack()

      // Send outgoing message
      if (outgoingMessage) {
        await pubsub.PublishOutgoing(outgoingMessage)
      }
    } catch (e) {
      await pubsub.PublishOutgoing(
        createOutgoingFromIncomingMessage(message, {
          name: 'error',
          parameters: {
            reason: e.toString() + "\n" + e.stack
          }
        })
      )
      ack()
    }
  })
}
