import { OperationOption, AssetRepository, ACLRepository, composeOperationOptions, WithKey, WithSystemOperation } from "../repositories";
import { FileStorage } from "@shio-bot/foundation";
import { Asset, AssetContentType } from "../entities/asset";
import { newGlobalError, ErrorType } from "../entities/error";
import { Permission, ResourceTag } from "../entities";



export interface InventoryUseCase {

  getDownloadableUrlBookAsset(assetId: string, contentType: AssetContentType, ...options: OperationOption[]): Promise<string>

}



export class DefaultInventoryUseCase implements InventoryUseCase {

  Storage: FileStorage
  Asset: AssetRepository
  Acl: ACLRepository
  constructor(Storage: FileStorage, Asset: AssetRepository, Acl: ACLRepository) {
    this.Storage = Storage
    this.Asset = Asset
    this.Acl = Acl
  }

  async findAssetByIdOrThrow(assetId: string): Promise<Asset> {
    const asset = await this.Asset.findById(assetId)
    if (!asset) {
      throw newGlobalError(ErrorType.NotFound, "asset with provided ID is not found")
    } else {
      return asset
    }
  }

  async getDownloadableUrlBookAsset(assetId: string, contentType: AssetContentType, ...options: OperationOption<any>[]): Promise<string> {

    const option = composeOperationOptions(...options)
    option.logger.info('get book downloadable url')
    const asset = await this.findAssetByIdOrThrow(assetId)

    // @TODO: skip acl verify
    // waiting for payment feature
    // await this.Acl.GetPermissionOrThrow(option.operationOwnerId, ResourceTag.fromAclTag(asset.aclTag), Permission.VIEWER, WithSystemOperation())
    let fileName = 'content.pdf'
    switch(contentType) {
      case 'application/pdf':
        fileName = 'content.pdf'
        break
    }
    const contentUrl = await this.Asset.AssetStorage.getDownloadUrlFromAsset(asset,fileName)
    return contentUrl

  }

}