export interface Payment {
  id: string
  amount: number
  method: 'linepay' | 'free'
  transactionId: string
}

export enum TransactionStatus {
  WAITING_FOR_PAYMENT = 'wating-payment',
  CANCELED = 'cancel',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export interface Transaction {
  id: string
  assetId: string
  status: TransactionStatus
  price: number
  userId: string

  /**
   * stellar://
   * gs://
   * ipfs://
   */
  describeURLs: string[]
}
