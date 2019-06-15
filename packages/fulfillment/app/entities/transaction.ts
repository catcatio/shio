export interface Payment {
  id: string
  amount: number
  method: 'linepay' | 'free'
  transactionId: string
}

export enum TransactionStatus {
  WAITING_FOR_PAYMENT,
  CANCELED,
  FAILED,
  COMPLETED,
}

export interface Transaction {
  id: string
  assetId: string
  status: TransactionStatus
  price: number

  /**
   * stellar://
   * gs://
   * ipfs://
   */
  describeURLs: string[]
}
