import { PaymentConfirmationPayload, ConfirmTransaction } from '@shio-bot/chatengine'
import { Payment } from '../types'
import { newLogger } from '@shio-bot/foundation'
import { ConfirmPaymentResultMessage } from '@shio-bot/foundation/entities'
import { PaymentRepository } from '../repositories'

export const confirmPaymentHandler = (p: Payment, paymentRepository: PaymentRepository) => {
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
    let c: ConfirmPaymentResultMessage = {
      type: 'ConfirmPaymentResult',
      provider: payload.provider,
      transactionId: payload.transactionId,
      orderId: payload.orderId,
      amount: reservePayment.amount,
      currency: reservePayment.currency,
      isCompleted: false
    }

    // call confirm payment to server
    await confirmTransaction(
      {
        transactionId: payload.transactionId,
        amount: reservePayment.amount,
        currency: reservePayment.currency
      },
      null as any
    )
      .then(response => {
        console.log(response)
        // send success reply to fulfillment
        c.isCompleted = true
        return p.confirmPayment(c)
      })
      .catch(err => {
        log.info(`failed to confirm transaction: ${err}`)
        // send failure reply to fulfillment
        c.isCompleted = false
        return p.confirmPayment(c)
      })
  }

  return {
    handle
  }
}
