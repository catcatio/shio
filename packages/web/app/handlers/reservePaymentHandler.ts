import { ReservePaymentListener, Payment } from '../types'
import { ReservePaymentMessage, ReservePaymentResultMessage } from '@shio-bot/foundation/entities'
import { PaymentClientProvider, LineReservePaymentRequest, PaymentClient, MessagingClientProvider } from '@shio-bot/chatengine'
import { PaymentRepository } from '../repositories'
import { newLogger } from '@shio-bot/foundation'

export const reservePaymentHandler = (
  confirmUrl: string,
  p: Payment,
  cp: MessagingClientProvider,
  provider: PaymentClientProvider,
  paymentRepository: PaymentRepository
): ReservePaymentListener => {
  let log = newLogger()
  return async (payload: ReservePaymentMessage): Promise<void> => {
    let client: PaymentClient
    try {
      client = provider.get(payload.provider)
      if (!client) {
        console.log('payment client not found')
        //NC:TODO: handle failure case, reply to confirm payment channel
        return
      }
    } catch (err) {
      log.error(`payment client: ${err}`)
      return
    }

    let request: LineReservePaymentRequest = {
      productName: payload.productName,
      productImageUrl: payload.productImageUrl,
      amount: payload.amount,
      currency: payload.currency,
      orderId: payload.orderId,
      confirmUrl: confirmUrl,
      langCd: 'th' // payment screen language
    }

    // store to memcache
    await client.reserve(request).then(async response => {
      let result: ReservePaymentResultMessage = {
        type: 'ReservePaymentResult',
        provider: 'linepay',
        isCompleted: false
      }
      console.log(response)
      if (response.returnCode != '0000') {
        console.error('failed to reserve payment: ', response)
        await p.confirmPayment(result)
        return
      }

      if (!response.info) {
        console.error('failed to reserve payment: ', response)
        await p.confirmPayment(result)
        return
      }
      result.transactionId = response.info.transactionId
      result.paymentUrl = response.info['paymentUrl']
        ? {
            web: response.info['paymentUrl'].web,
            app: response.info['paymentUrl'].app
          }
        : undefined

      // HACK: to remove
      payload.source &&
        cp.get('line').sendMessage({
          provider: 'line',
          replyToken: '',
          to: payload.source.userId,
          text: response.info['paymentUrl'].web
        })

      await p.confirmPayment(result)
      return paymentRepository.push(response.info.transactionId, payload)
    })

    //NC:TODO: handle failure case, reply to confirm payment channel
  }
}
