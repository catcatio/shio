import { DatastoreBaseRepository, OperationOption, composeOperationOptions, Transactionalable } from "./common";
import { Transaction, TransactionStatus, Payment } from "../entities/transaction";
import { newGlobalError, ErrorType } from "../entities/error";
import { Omit } from "../entities";
import { PaymentChannelTransport } from "@shio-bot/foundation/transports/pubsub";
const nanoid = require('nanoid')

export interface TransactionRepository extends Transactionalable<TransactionRepository> {
  create(assetId: string, price: number, ...options: OperationOption[]): Promise<Transaction>
  updateById(txId: string, input: UpdateTransactionInput, ...options: OperationOption[]): Promise<void>
  findById(txId: string, ...options: OperationOption[]): Promise<Transaction>
  createPayment(txId: string, method: string, price: number, ...options: OperationOption[]): Promise<Payment>

}

export type UpdateTransactionInput = Omit<Transaction, 'id' | 'assetId' | 'price'>

export function isPaymentMethod(value: any): value is Payment['method'] {
  if (typeof value !== 'string') {
    return false
  } else if (!value.match(/linepay|free/)) {
    return false
  }
  return true
}

function initialTransaction(assetId: string, price: number): Transaction {
  const id = nanoid(32)
  return {
    id,
    assetId,
    price,
    describeURLs: [],
    status: TransactionStatus.WAITING_FOR_PAYMENT,
  }
}

export class DatastoreTransactionRepository extends DatastoreBaseRepository implements TransactionRepository {
  private TransactionKind = 'transaction'
  private PaymentKind = 'transaction-payment'

  async create(assetId: string, price: number, ...options: OperationOption[]): Promise<Transaction> {
    const option = composeOperationOptions(...options)
    const tx = initialTransaction(assetId, price)

    const key = this.key(this.TransactionKind, tx.id)
    option.logger.withFields({ id: tx.id }).info("create transaction")
    await this.db.save({
      key,
      data: tx
    })
    option.logger.info("transaction recorded!")
    return tx
  }

  async createPayment(txId: string, method: string, price: number, ...options: OperationOption[]) {
    const option = composeOperationOptions(...options)
    option.logger.withFields({ txId: txId }).info("create payment info")
    if (!isPaymentMethod(method)) {
      throw newGlobalError(ErrorType.Input, `payment method invalid, (${method})`)
    }
    const id = nanoid(32)
    const key = await this.key(this.TransactionKind, txId, this.PaymentKind, id)
    const payment: Payment = {
      amount: price,
      method: method,
      transactionId: txId,
      id,
    }
    await this.db.save({
      key,
      data: payment
    })
    return payment
  }

  async updateById(txId: string, input: UpdateTransactionInput, ...options: OperationOption[]): Promise<void> {
    const option = composeOperationOptions(...options)
    const data = await this.findById(txId)
    option.logger.withFields({ id: txId }).info("update transaction")
    const key = this.key(this.TransactionKind, txId)
    await this.db.save({
      key,
      data: {
        ...data,
        ...input
      }
    })
  }

  async findById(txId: string, ...options: OperationOption[]): Promise<Transaction> {
    const output = await this.getByKey(this.key(this.TransactionKind, txId))
    return output
  }

  async begin(...options: OperationOption[]) {
    const option = composeOperationOptions(...options)
    option.logger.info("begin transaction")
    const tx = this.db.transaction()
    await tx.run()
    return new DatastoreTransactionRepository(tx)
  }




}