export interface ReservePayment {}

export interface ConfirmPayment {}

export type PaymentProvider = 'linepay'

export type CurrencyTHB = 'THB'
export type CurrencyTWD = 'TWD'
export type CurrencyJPY = 'JPY'
export type CurrencyUSD = 'USD'

export type Currency = CurrencyTHB | CurrencyTWD | CurrencyJPY | CurrencyUSD

export interface ReservePayment {
  provider: PaymentProvider
  orderId: string
  productName: string
  productImageUrl?: string
  amount: number
  currency: Currency
}

export interface ConfirmPayment {
  provider: PaymentProvider
  orderId: string
  transactionId: string
  amount: number
  currency: Currency
  isCompleted: boolean
}
