export interface ReservePayment {}

export interface ConfirmPayment {}

export type PaymentProvider = 'linepay'

export interface ReservePayment {
  provider: PaymentProvider
}

export interface ConfirmPayment {
  provider: PaymentProvider
}
