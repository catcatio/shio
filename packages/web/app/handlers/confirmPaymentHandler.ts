import { PaymentConfirmationPayload, ConfirmTransaction, MessagingClientProvider, MessagingClient, LineMessageClientSendCustomMessagesInput } from '@shio-bot/chatengine'
import { Payment } from '../types'
import { newLogger } from '@shio-bot/foundation'
import { ConfirmPaymentResultMessage } from '@shio-bot/foundation/entities'
import { PaymentRepository } from '../repositories'
import { LinePayParser } from '../helpers/linePayParser'

export const confirmPaymentHandler = (p: Payment, cp: MessagingClientProvider, paymentRepository: PaymentRepository) => {
  const log = newLogger()

  const handle = async (payload: PaymentConfirmationPayload, confirmTransaction: ConfirmTransaction): Promise<any> => {
    // check transaction id from cache
    let reservePayment = await paymentRepository.get(payload.transactionId)

    if (!reservePayment) {
      log.info(`transaction [${payload.transactionId}] not found`)
      return await confirmTransaction(null as any, new Error('transaction not found'))
    }
    // verify amount and currency
    // if (reservePayment.orderId != payload.orderId) {
    //   log.info(`orderId [${payload.orderId}] mismatch: (actual: ${reservePayment.orderId})`)
    //   return await confirmTransaction(null as any, new Error('mismatch information'))
    // }

    let messageParser
    const messagingClient: MessagingClient = cp.get(reservePayment.provider === 'linepay' ? 'line' : '')

    if (reservePayment.provider === 'linepay') {
      messageParser = new LinePayParser()
    }

    let c: ConfirmPaymentResultMessage = {
      type: 'ConfirmPaymentResult',
      provider: payload.provider,
      transactionId: payload.transactionId,
      orderId: payload.orderId,
      amount: reservePayment.amount,
      currency: reservePayment.currency,
      isCompleted: false
    }

    const input: LineMessageClientSendCustomMessagesInput = {
      provider: 'line',
      replyToken: '',
      to: reservePayment && reservePayment.source ? reservePayment.source.userId : '',
      message: ''
    }
    // call confirm payment to server
    try {
      const response = await confirmTransaction(
        {
          transactionId: payload.transactionId,
          amount: reservePayment.amount,
          currency: reservePayment.currency
        },
        null as any
      )
      input.message = messageParser[c.type](c, reservePayment)
      console.log(response)
      c.isCompleted = true
    } catch (err) {
      log.info(`failed to confirm transaction: ${err}`)
      input.message = { type: 'text', text: 'purchase failed' }
      c.isCompleted = false
    } finally {
      await messagingClient.sendCustomMessages(input).catch(err => console.log(err))
      return p.confirmPayment(c)
    }
  }

  return {
    handle
  }
}
