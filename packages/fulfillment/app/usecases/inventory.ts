import { OperationOption, AssetRepository, ACLRepository, composeOperationOptions, WithKey, WithSystemOperation } from "../repositories";
import { FileStorage } from "@shio-bot/foundation";
import { AssetContentType, AssetMetadataBookKind } from "@shio-bot/foundation/entities";
import { newGlobalError, ErrorType } from "../entities/error";
import { Permission, ResourceTag } from "../entities";
import { Asset } from "../entities/asset";



export interface InventoryUseCase {

  getAssetDownloadableUrl(assetId: string, contentType: AssetContentType, ...options: OperationOption[]): Promise<string | undefined>
  getBookAsset(assetId: string, ...options: OperationOption[]): Promise<Asset>

}



export class DefaultInventoryUseCase implements InventoryUseCase {

  async getBookAsset(assetId: string, ...options: OperationOption<any>[]): Promise<Asset> {
    const option = composeOperationOptions(...options)
    const asset = await this.findAssetByIdOrThrow(assetId)
    // await this.Acl.IsGrantedOrThrow(option.operationOwnerId, ResourceTag.fromAclTag(asset.aclTag), Permission.VIEWER)
    return asset
  }

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

  async getAssetDownloadableUrl(assetId: string, contentType: AssetContentType, ...options: OperationOption<any>[]): Promise<string | undefined> {

    const option = composeOperationOptions(...options)
    option.logger.info('get book downloadable url')
    const asset = await this.findAssetByIdOrThrow(assetId)

    // @TODO: skip acl verify
    // waiting for payment feature
    // await this.Acl.IsGrantedOrThrow(option.operationOwnerId, ResourceTag.fromAclTag(asset.aclTag), Permission.VIEWER)

    if (asset.meta.kind === AssetMetadataBookKind) {
      let fileName = 'content.pdf'
      switch (contentType) {
        case 'application/pdf':
          fileName = 'content.pdf'
          break
      }
      const contentUrl = await this.Asset.AssetStorage.getDownloadUrlFromAsset(asset, fileName)
      return contentUrl
    }


  }

}