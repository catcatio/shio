import { IncommingMessageSource } from './message'

export type PaymentProvider = 'linepay'

export type CurrencyTHB = 'THB'
export type CurrencyTWD = 'TWD'
export type CurrencyJPY = 'JPY'
export type CurrencyUSD = 'USD'

export type Currency = CurrencyTHB | CurrencyTWD | CurrencyJPY | CurrencyUSD

export function isReservePaymentMessage(value: any): value is ReservePaymentMessage {
  if (!value) {
    return false
  }
  if (value['type'] === ReservePaymentMessageType) {
    return true
  }
  return false
}
export const ReservePaymentMessageType = 'ReservePayment'
export interface ReservePaymentMessage {
  type: typeof ReservePaymentMessageType
  provider: PaymentProvider
  orderId: string
  productName: string
  productDescription?: string
  productImageUrl?: string
  amount: number
  currency: Currency
  source?: IncommingMessageSource
}

export const ReservePaymentResultMessageType = 'ReservePaymentResult'
export const ConfirmPaymentResultMessageType = 'ConfirmPaymentResult'
export type ConfirmPaymentMessage = ConfirmPaymentResultMessage | ReservePaymentResultMessage

export interface ReservePaymentResultMessage {
  type: typeof ReservePaymentResultMessageType
  provider: PaymentProvider
  transactionId?: string
  paymentUrl?: {
    web: string
    app: string
  }
  isCompleted: boolean
}
export interface ConfirmPaymentResultMessage {
  type: typeof ConfirmPaymentResultMessageType
  provider: PaymentProvider
  orderId: string
  transactionId: string
  amount: number
  currency: Currency
  isCompleted: boolean
}
