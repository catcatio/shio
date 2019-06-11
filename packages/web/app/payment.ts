import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'
import { Payment, ReservePaymentListener } from './types'
import { ReservePaymentMessage, ConfirmPaymentMessage } from '@shio-bot/foundation/entities'

export const payment = (pubsub: PaymentChannelTransport): Payment => {
  const onReservePayment = (listener: ReservePaymentListener) => {
    let paymentListener = async (message: ReservePaymentMessage, acknowledge: () => void): Promise<void> => {
      await listener(message)
      acknowledge()
    }

    pubsub.SubscribeIncoming(paymentListener)
  }

  const confirmPayment = async (msg: ConfirmPaymentMessage): Promise<void> => {
    return pubsub.PublishOutgoing(msg)
  }

  return {
    onReservePayment,
    confirmPayment
  }
}
