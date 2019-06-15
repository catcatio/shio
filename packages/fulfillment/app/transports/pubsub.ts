import { newLogger, MessageChannelTransport, UnPromise } from '@shio-bot/foundation'
import { FulfillmentEndpoint } from '../endpoints'
import {
  createOutgoingFromIncomingMessage,
} from '@shio-bot/foundation/entities'
import { newGlobalError, ErrorType } from '../entities/error'
import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'
import { EndpointFuntion } from '../endpoints/default';

export function registerPubsub(pubsub: MessageChannelTransport, paymentPubsub: PaymentChannelTransport, endpoints: FulfillmentEndpoint) {
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
    let msg: UnPromise<ReturnType<EndpointFuntion>>
    try {
      const endpoint = endpoints[message.intent.name]
      if (!endpoint) {
        throw newGlobalError(ErrorType.NotFound, 'intent fultillment not found')
      }

      // do task and resolve
      // outoging message
      msg = await endpoint(message)
      ack()

      if (!msg) {
        return
      }
      // Send outgoing message
      // if there are any fulfillment
      // return from outgoing message
      log.withFields({ fulfillments: msg.fulfillment.map(f => f.name).join(',') }).info('publish outgoing message')
      await pubsub.PublishOutgoing(msg)

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
