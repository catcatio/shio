export type PaymentProvider = 'linepay'

export type CurrencyTHB = 'THB'
export type CurrencyTWD = 'TWD'
export type CurrencyJPY = 'JPY'
export type CurrencyUSD = 'USD'

export type Currency = CurrencyTHB | CurrencyTWD | CurrencyJPY | CurrencyUSD

export interface ReservePaymentMessage {
  provider: PaymentProvider
  orderId: string
  productName: string
  productImageUrl?: string
  amount: number
  currency: Currency
}

export type ConfirmPaymentMessage = ConfirmPaymentResultMessage | ReservePaymentResultMessage

export interface ReservePaymentResultMessage {
  type: 'ReservePaymentResult'
  provider: PaymentProvider
  transactionId?: string
  paymentUrl?: {
    web: string
    app: string
  }
  isCompleted: boolean
}
export interface ConfirmPaymentResultMessage {
  type: 'ConfirmPaymentResult'
  provider: PaymentProvider
  orderId: string
  transactionId: string
  amount: number
  currency: Currency
  isCompleted: boolean
}
