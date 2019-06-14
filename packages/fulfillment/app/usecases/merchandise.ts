import { PaginationResult } from '@shio-bot/foundation/entities'
import { Asset } from '../entities/asset'
import { ACLRepository, UserRepository, WithOperationOwner, WithPagination, WithSystemOperation, OperationOption, composeOperationOptions } from '../repositories'
import { AssetRepository } from '../repositories/asset'
import { ErrorType, newGlobalError } from '../entities/error'

interface MerchandiseListItemInput {
  merchandiseId?: string
  limit?: number
  offset?: number
}
export interface MerchandiseUseCase {
  listItem(input: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>>
  findAssetByIdOrThrow(assetId: string): Promise<Asset>
}

export class DefaultMerchandiseUseCase implements MerchandiseUseCase {
  public Acl: ACLRepository
  public User: UserRepository
  public Asset: AssetRepository

  constructor(aclRepository: ACLRepository, userRepository: UserRepository, assetRepository: AssetRepository) {
    this.Acl = aclRepository
    this.User = userRepository
    this.Asset = assetRepository
  }

  public async listItem({ limit, merchandiseId, offset }: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>> {
    const option = composeOperationOptions(...options)
    return this.Asset.findMany(WithPagination(limit, offset), WithOperationOwner(option.operationOwnerId))
  }

  public async findAssetByIdOrThrow(assetId: string): Promise<Asset> {
    const asset = await this.Asset.findById(assetId)
    if (!asset) {
      throw newGlobalError(ErrorType.NotFound, 'asset with provided ID is not found')
    } else {
      return asset
    }
  }
}
