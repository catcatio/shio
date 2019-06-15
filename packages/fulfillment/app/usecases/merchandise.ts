import { PaginationResult, AssetMetadata, ReservePaymentResultMessageType, ReservePaymentMessageType, ReservePaymentMessage, AssetMetadataBookKind, AssetMetadataEventKind } from '@shio-bot/foundation/entities'
import { Asset } from '../entities/asset'
import { ACLRepository, UserRepository, WithOperationOwner, WithPagination, WithSystemOperation, OperationOption, composeOperationOptions } from '../repositories'
import { AssetRepository } from '../repositories/asset'
import { ErrorType, newGlobalError } from '../entities/error'
import { TransactionRepository } from '../repositories/transaction';
import { TransactionStatus } from '../entities/transaction';
import { ResourceTag, Permission } from '../entities';
import { PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub';

interface MerchandiseListItemInput {
  merchandiseId?: string
  limit?: number
  offset?: number
}
interface MerchandisePurchaseItemOutput {
  meta: AssetMetadata
  price: number
  id: string
  txId: string
}
export interface MerchandiseUseCase {
  listItem(input: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>>
  findAssetByIdOrThrow(assetId: string, ...options: OperationOption[]): Promise<Asset>
  requestPurchaseItem(assetId: string, ...options: OperationOption[]): Promise<MerchandisePurchaseItemOutput>
  commitPurchaseItem(txId: string, method: string, amount: number, ...options: OperationOption<any>[]): Promise<void>

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

  async commitPurchaseItem(txId: string, method: string, amount: number, ...options: OperationOption<any>[]): Promise<void> {
    const option = composeOperationOptions(...options)
    option.logger.withFields({ txId, method, amount }).info('confirm payment to transaction')

    const tx = await this.Transaction.begin()
    const purchaseTransaction = await this.Transaction.findById(txId)
    if (!purchaseTransaction) {
      await tx.rollback()
      throw newGlobalError(ErrorType.NotFound, `tx id not found (${txId})`)
    }

    await tx.createPayment(purchaseTransaction.id, method, amount)

    if (amount >= purchaseTransaction.price) {
      await tx.updateById(purchaseTransaction.id, {
        describeURLs: [],
        status: TransactionStatus.COMPLETED,
      })
      const asset = await this.findAssetByIdOrThrow(purchaseTransaction.assetId)
      await this.Acl.CreatePermission(option.operationOwnerId, ResourceTag.fromAclAble(asset), Permission.VIEWER, WithSystemOperation())
      await tx.commit()
    } else {
      await tx.commit()

      // invalid amount or amount not enough
      // ตรงนี้ถ้าหากยอดยังไม่ถึ
      // ให้จ่ายจนกว่ายอดจะถึง แต่ตอนนี้
      // ให้ปัดข้ามไปก่อน
      // @TODO implement sum of payment and check if
      // it consist with transaction
      throw newGlobalError(ErrorType.Input, `payment invalid, amount require is ${purchaseTransaction.price} but receive ${amount}`)
    }

  }
  async requestPurchaseItem(assetId: string, ...options: OperationOption<any>[]): Promise<MerchandisePurchaseItemOutput> {
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

    const tx = await this.Transaction.create(asset.id, asset.price || 0, ...options)
    option.logger.withFields({tx: tx.id}).info("transaction created!")

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
    }

    // ถ้า Asset เป็นชนิด Book
    // ให้เอา cover image ที่อยู่ใน packet มาใช้เป็น
    // ภาพ cover ภายใน reserve message
    // โดยต้องเอา URL เปลี่ยนเป็น Downloadable URL ก่อน
    if (asset.meta.kind === AssetMetadataBookKind) {

      const downloadableCoverImageUrl = await this.Asset.AssetStorage.getDownloadUrlFromDescribeUrl(asset.meta.coverImageURL, "")
      reservePaymentMessage.productImageUrl = downloadableCoverImageUrl
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

  public async listItem({ limit, merchandiseId, offset }: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>> {
    const option = composeOperationOptions(...options)
    return this.Asset.findMany(WithPagination(limit, offset), WithOperationOwner(option.operationOwnerId))
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
