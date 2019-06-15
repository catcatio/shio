import { ReservePaymentListener, Payment } from '../types'
import { ReservePaymentMessage, ReservePaymentResultMessage } from '@shio-bot/foundation/entities'
import {
  PaymentClientProvider,
  LineReservePaymentRequest,
  PaymentClient,
  MessagingClientProvider,
  MessagingClient,
  LineMessageClientSendCustomMessagesInput
} from '@shio-bot/chatengine'
import { PaymentRepository } from '../repositories'
import { newLogger } from '@shio-bot/foundation'
import { LinePayParser } from '../helpers/linePayParser'

export const reservePaymentHandler = (
  confirmUrl: string,
  p: Payment,
  cp: MessagingClientProvider,
  provider: PaymentClientProvider,
  paymentRepository: PaymentRepository
): ReservePaymentListener => {
  let log = newLogger()
  return async (payload: ReservePaymentMessage): Promise<void> => {

    if (!payload.source) {
      log.error("invalid payload source")
      log.info(JSON.stringify(payload))
      return
    }

    let client: PaymentClient
    const { amount, productName, orderId } = payload
    log
      .withFields({
        amount, productName, orderId
      })
      .info('reserve payment process....')
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

    let messageParser
    const messagingClient: MessagingClient = cp.get(payload.provider === 'linepay' ? 'line' : '')

    if (payload.provider === 'linepay') {
      messageParser = new LinePayParser()
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

    const input: LineMessageClientSendCustomMessagesInput = {
      provider: 'line',
      replyToken: '',
      to: payload.source ? payload.source.userId : '',
      message: ''
    }
    // store to memcache
    try {
      let result: ReservePaymentResultMessage = {
        type: 'ReservePaymentResult',
        provider: 'linepay',
        isCompleted: false
      }

      if (payload.amount) {
        const response = await client.reserve(request)

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

        await paymentRepository.push(response.info.transactionId, payload)
      }

      result.isCompleted = true
      input.message = messageParser[result.type](result, payload)
      console.log(`payload: ${JSON.stringify(input)}`)
      await p.confirmPayment(result)
    } catch (err) {
      input.message = 'something wrong, cannot reserve payment'
      log.error(`failed to reserve payment ${payload.orderId}: ${err}`)
    } finally {
      await messagingClient.sendCustomMessages(input).catch(err => console.log(err))
      return
    }

    //NC:TODO: handle failure case, reply to confirm payment channel
  }
}
