import { ReservePaymentMessage } from '@shio-bot/foundation/entities'

export interface PaymentRepository {
  get(transactionId: string): Promise<ReservePaymentMessage>
  push(transactionId: string, payment: ReservePaymentMessage): Promise<void>
  remove(transactionId: string): Promise<void>
}

export const paymentRepository = (): PaymentRepository => {
  const cache: { [transactionId: string]: ReservePaymentMessage } = {}
  const get = async (transactionId: string): Promise<ReservePaymentMessage> => {
    return cache[transactionId]
  }

  const push = async (transactionId: string, payment: ReservePaymentMessage): Promise<void> => {
    cache[transactionId] = payment
  }

  const remove = async (transactionId: string): Promise<void> => {
    delete cache[transactionId]
  }

  return {
    get,
    push,
    remove
  }
}
