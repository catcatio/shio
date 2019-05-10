enum PaymentStatus {
  INITIAL,
  CONFIRM,
  FAILED
}
interface Payment {
  amount: number
  method: number
  status: PaymentStatus
  transactionId: string
}

enum TransactionStatus {
  WAITING_FOR_PAYMENT,
  CANCELED,
  FAILED,
  COMPLETED,
}

interface Transaction {
  id: string
  assetId: string
  status: TransactionStatus
  paymentId?: string

  /**
   * stellar://
   * gs://
   * ipfs://
   */
  describeURLs: string[]
}
