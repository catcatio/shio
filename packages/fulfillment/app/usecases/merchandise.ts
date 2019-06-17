import { PaginationResult, AssetMetadata, ReservePaymentResultMessageType, ReservePaymentMessageType, ReservePaymentMessage, AssetMetadataBookKind, AssetMetadataEventKind, IncommingMessageSource } from '@shio-bot/foundation/entities'
import { Asset } from '../entities/asset'
import { ACLRepository, UserRepository, WithOperationOwner, WithPagination, WithSystemOperation, OperationOption, composeOperationOptions, WithWhere } from '../repositories'
import { AssetRepository } from '../repositories/asset'
import { ErrorType, newGlobalError } from '../entities/error'
import { TransactionRepository } from '../repositories/transaction';
import { TransactionStatus, Transaction } from '../entities/transaction';
import { ResourceTag, Permission } from '../entities';
import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub';
import { logger } from '@shio-bot/foundation';

interface MerchandiseListItemInput {
  merchandiseId?: string
  limit?: number
  offset?: number
}
interface MerchandiseRequestPurchaseItemOutput {
  meta: AssetMetadata
  price: number
  id: string
  txId: string
}
interface MerchandiseCommitPurchaseItemOutput {
  assetId: string
  assetMeta: AssetMetadata
  txId: string
  completed: boolean
  status: TransactionStatus
  description: string
}


/**
 * Merchandise use case
 * user Id โดยทั้งหมดจะต้องอ้างอิงจาก OperationOwner
 */
export interface MerchandiseUseCase {
  listItem(input: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>>
  findAssetByIdOrThrow(assetId: string, ...options: OperationOption[]): Promise<Asset>
  requestPurchaseItem(assetId: string, source: IncommingMessageSource, ...options: OperationOption[]): Promise<MerchandiseRequestPurchaseItemOutput>
  commitPurchaseItem(txId: string, method: string, amount: number, ...options: OperationOption<any>[]): Promise<MerchandiseCommitPurchaseItemOutput>

}

export class DefaultMerchandiseUseCase implements MerchandiseUseCase {

  public Acl: ACLRepository
  public User: UserRepository
  public Asset: AssetRepository
  public Transaction: TransactionRepository
  public paymentChannel: PaymentChannelTransport

  constructor(aclRepository: ACLRepository, userRepository: UserRepository, assetRepository: AssetRepository, txRepository: TransactionRepository, paymentChannel: PaymentChannelTransport) {
    this.Acl = aclRepository
    this.User = userRepository
    this.Asset = assetRepository
    this.Transaction = txRepository
    this.paymentChannel = paymentChannel
  }

  async commitPurchaseItem(txId: string, method: string, amount: number, ...options: OperationOption<any>[]): Promise<MerchandiseCommitPurchaseItemOutput> {
    const option = composeOperationOptions(...options)
    option.logger.withFields({ txId, method, amount }).info('confirm payment to transaction')
    if (!txId) {
      throw newGlobalError(ErrorType.Input, 'tx ID is required to commit purchase item')
    }

    /**
     * ใช้ atomic เพื่อทำ commit transaction
     * ประกอบด้วย
     * - หา transaction
     * - สร้าง payment ให้ transaction
     */
    const tx = await this.Transaction.begin()
    const purchaseTransaction = await this.Transaction.findById(option.operationOwnerId, txId)
    if (!purchaseTransaction) {
      // transaction นี้ไม่มีอยู่จริง
      await tx.rollback()
      throw newGlobalError(ErrorType.NotFound, `tx id not found (${txId})`)
    } else if (purchaseTransaction.status !== TransactionStatus.WAITING_FOR_PAYMENT) {

      /**
       * หาก Transaction ไม่ใช่ WAITING_FOR_PAYMENT
       * จะไม่ให้มีการดำเนินการต่อ
       */
      await tx.rollback()
      throw newGlobalError(ErrorType.Forbidden, `tx (${txId}) status is not WAITING_FOR_PAYMENT`)
    }

    await tx.createPayment(option.operationOwnerId, purchaseTransaction.id, method, amount)
    const asset = await this.findAssetByIdOrThrow(purchaseTransaction.assetId)

    /**
     * ในกรณีที่จ่ายมาเท่ากับราคาของ asset หรือมากกว่า
     * จะให้ granted ไปเลย แล้ว stamp transaction
     * เป็น status COMPLETED
     * และเพิ่ม Acl Viewer ให้กับ user 
     */
    if (amount >= purchaseTransaction.price) {

      await tx.updateById(option.operationOwnerId, purchaseTransaction.id, {
        ...purchaseTransaction,
        status: TransactionStatus.COMPLETED,
      })
      await this.Acl.CreatePermission(option.operationOwnerId, ResourceTag.fromAclable(asset), Permission.VIEWER, WithSystemOperation())
      await tx.commit()

      return {
        assetId: asset.id,
        assetMeta: asset.meta,
        completed: false,
        status: purchaseTransaction.status,
        description: `payment completed`,
        txId: purchaseTransaction.id,
      }
    } else {
      await tx.commit()

      // invalid amount or amount not enough
      // ตรงนี้ถ้าหากยอดยังไม่ถึ
      // ให้จ่ายจนกว่ายอดจะถึง แต่ตอนนี้
      // ให้ปัดข้ามไปก่อน
      // @TODO implement sum of payment and check if
      return {
        assetId: asset.id,
        assetMeta: asset.meta,
        completed: false,
        status: purchaseTransaction.status,
        description: `payment invalid, amount require is ${purchaseTransaction.price} but receive ${amount}`,
        txId: purchaseTransaction.id,
      }
    }

  }
  async requestPurchaseItem(assetId: string, source: IncommingMessageSource, ...options: OperationOption<any>[]): Promise<MerchandiseRequestPurchaseItemOutput> {
    const option = composeOperationOptions(...options)
    option.logger.withFields({ assetId }).info("request purchase item")

    /**
     * ค้นหา asset เพื่อดูราคา
     * จากนั้นสร้าง transaction ของการซื้อขาย
     * โดยจะเป็น INIT status ก่อนเสอม
     */
    const asset = await this.findAssetByIdOrThrow(assetId, WithSystemOperation())
    option.logger.withFields({
      id: assetId,
      price: asset.price + ""
    }).info("buy item...")

    const tx = await this.Transaction.create(option.operationOwnerId, asset.id, asset.price || 0, ...options)
    option.logger.withFields({ tx: tx.id }).info("transaction created!")

    /**
     * หลังจากสร้าง Transaction แล้ว
     * ส่ง message การ reserve payment เพื่อให้
     * service chatbot นำเอาไปสร้างเป็น payment information
     * เพื่อทำการจ่ายเงินผ่าน provider
     */
    const reservePaymentMessage: ReservePaymentMessage = {
      amount: tx.price || 0,
      currency: 'THB',
      orderId: tx.id,
      productName: asset.meta.title,
      provider: 'linepay',
      type: ReservePaymentMessageType,
      source,
    }

    // ถ้า Asset เป็นชนิด Book
    // ให้เอา cover image ที่อยู่ใน packet มาใช้เป็น
    if (asset.meta.kind === AssetMetadataBookKind) {

      reservePaymentMessage.productImageUrl = asset.meta.coverImageURL
      reservePaymentMessage.productDescription = asset.meta.description

    } else if (asset.meta.kind === AssetMetadataEventKind) {
      // @TODO: ถ้าเป็น Event kind ให้ทำยังไง
      // ค่อยทำ 
    }

    this.paymentChannel.PublishReservePayment(reservePaymentMessage).then(() => {
      option.logger.withFields({ assetId: asset.id, txId: tx.id }).info("published reserve payment record!!")
    })

    return {
      id: asset.id,
      txId: tx.id,
      meta: asset.meta,
      price: asset.price || 0,
    }
  }

  public async listItem({ limit, merchandiseId, offset }: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset & { isOwnByOperationOwner?: boolean }>> {
    const option = composeOperationOptions(...options)
    const assetResults = await this.Asset.findMany(WithPagination(limit, offset), WithOperationOwner(option.operationOwnerId))


    /**
     * เพิ่ม parameter สำหรับบอกว่า
     * ผู้ที่เรียกดู listItem เคยซื้อสินค้านี้ไว้แล้ว
     * หรือเปล่า
     */
    assetResults.records = await Promise.all(assetResults.records.map(async (asset) => {
      const transactionResult = await this.Transaction.findMany(WithWhere<Transaction>({
        status: {
          Equal: TransactionStatus.COMPLETED
        },
        userId: {
          Equal: option.operationOwnerId,
        },
        assetId: {
          Equal: asset.id
        }
      }))

      return {
        ...asset,
        isOwnByOperationOwner: transactionResult.length > 0
      }
    }))


    return assetResults
  }

  public async findAssetByIdOrThrow(assetId: string, ...options: OperationOption[]): Promise<Asset> {
    const option = composeOperationOptions(...options)
    const asset = await this.Asset.findById(assetId, ...options)
    if (!asset) {
      throw newGlobalError(ErrorType.NotFound, 'asset with provided ID is not found')
    } else {
      return asset
    }
  }
}
