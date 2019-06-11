import { newLogger, MessageChannelTransport } from '@shio-bot/foundation'
import { FulfillmentEndpoint } from '../endpoints'
import { createOutgoingFromIncomingMessage, OutgoingMessage, ReservePaymentMessage } from '@shio-bot/foundation/entities'
import { newGlobalError, ErrorType } from '../entities/error'
import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'

export function registerPubsub(pubsub: MessageChannelTransport, paymentPubsub: PaymentChannelTransport, endpoints: FulfillmentEndpoint) {
  const log = newLogger()

  const isOutgoingMessage = (obj: any): boolean => {
    return obj && obj.requestId
  }

  const isReservePaymentMessage = (obj: any): boolean => {
    return obj && obj.orderId
  }

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
    let msg: OutgoingMessage | ReservePaymentMessage | void
    try {
      const endpoint = endpoints[message.intent.name]
      if (!endpoint) {
        throw newGlobalError(ErrorType.NotFound, 'intent fultillment not found')
      }

      // do task and resolve
      // outoging message
      msg = await endpoint(message)

      ack()

      // Send outgoing message

      if (isOutgoingMessage(msg)) {
        log.info('OutgoingMessage')
        await pubsub.PublishOutgoing(msg as OutgoingMessage)
      } else if (isReservePaymentMessage(msg)) {
        log.info('ReservePaymentMessage')
        await paymentPubsub.PublishReservePayment(msg as ReservePaymentMessage)
      }
    } catch (e) {
      await pubsub.PublishOutgoing(
        createOutgoingFromIncomingMessage(message, {
          name: 'error',
          parameters: {
            reason: e.toString() + '\n' + e.stack
          }
        })
      )
      ack()
    }
  })

  paymentPubsub.SubscribeConfirmPayment(async (message, ack) => {
    log.info(`confirm payment message begin process...`)

    /* TODO: handle
        - ReservePaymentResultMessage
        - ConfirmPaymentResultMessage
    */
    log.info(JSON.stringify(message))

    ack()
  })
}
