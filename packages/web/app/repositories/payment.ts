import { ReservePayment } from '@shio-bot/foundation/entities'

export interface PaymentRepository {
  get(transactionId: string): Promise<ReservePayment>
  push(transactionId: string, payment: ReservePayment): Promise<void>
  remove(transactionId: string): Promise<void>
}

export const paymentRepository = (): PaymentRepository => {
  const cache: { [transactionId: string]: ReservePayment } = {}
  const get = async (transactionId: string): Promise<ReservePayment> => {
    return cache[transactionId]
  }

  const push = async (transactionId: string, payment: ReservePayment): Promise<void> => {
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
