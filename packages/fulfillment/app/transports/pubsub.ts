import { CloudPubsubTransports, newLogger } from '@shio/foundation'
import { FulfillmentEndpoint } from '../endpoints';
import { createOutgoingFromIncomingMessage } from '@shio/foundation/entities';



export function registerPubsub(pubsub: CloudPubsubTransports, endpoint: FulfillmentEndpoint) {
  const log = newLogger()

  pubsub.SubscribeIncommingMessage(async (message, ack) => {
    log.withUserId(message.source.userId).info(`Incoming message from ${message.provider}`)
    try {
      switch (message.intent.name) {
        case 'follow':
          const outgoingMessage = await endpoint.follow(message)
          if (outgoingMessage) {
            await pubsub.PublishOutgoingMessage(outgoingMessage)
          }
          ack()
          break
        default:
          ack()
          break
      }
    } catch (e) {
      await pubsub.PublishOutgoingMessage(createOutgoingFromIncomingMessage(message, {
        name: 'error',
        parameters: {
          reason: JSON.stringify(e),
        }
      }))
      ack()
    }
  })
}
