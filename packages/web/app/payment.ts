import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'
import { Payment, ReservePaymentListener } from './types'
import { ReservePayment, ConfirmPayment } from '@shio-bot/foundation/entities'

export const payment = (pubsub: PaymentChannelTransport): Payment => {
  const onReservePayment = (listener: ReservePaymentListener) => {
    let paymentListener = async (message: ReservePayment, acknowledge: () => void): Promise<void> => {
      await listener(message)
      acknowledge()
    }

    pubsub.SubscribeIncoming(paymentListener)
  }

  const confirmPayment = async (msg: ConfirmPayment): Promise<void> => {
    return pubsub.PublishOutgoing(msg)
  }

  return {
    onReservePayment,
    confirmPayment
  }
}
