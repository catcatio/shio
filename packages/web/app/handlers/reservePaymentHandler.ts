import { ReservePaymentListener } from '../types'
import { ReservePaymentMessage } from '@shio-bot/foundation/entities'
import { PaymentClientProvider, LineReservePaymentRequest } from '@shio-bot/chatengine'

export const reservePaymentHandler = (provider: PaymentClientProvider): ReservePaymentListener => {
  return async (payload: ReservePaymentMessage): Promise<void> => {
    let client = provider.get(payload.provider)
    if (!client) {
      console.log('payment client not found')
      //NC:TODO: handle failure case, reply to confirm payment channel
      return
    }

    let request: LineReservePaymentRequest = {
      productName: payload.productName,
      productImageUrl: payload.productImageUrl,
      amount: payload.amount,
      currency: payload.currency,
      orderId: payload.orderId,
      confirmUrl: '',
      langCd: 'th' // payment screen language
    }

    // store to memcache

    client.reserve(request).then()

    //NC:TODO: handle failure case, reply to confirm payment channel

    console.log(payload)
  }
}
