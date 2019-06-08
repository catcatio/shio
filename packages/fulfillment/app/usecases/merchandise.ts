import { Asset, PaginationResult } from "../entities/asset";
import { ACLRepository, UserRepository, WithOperationOwner, WithPagination, WithSystemOperation, OperationOption, composeOperationOptions } from "../repositories";
import { AssetRepository } from "../repositories/asset";


interface MerchandiseListItemInput {
  merchandiseId?: string
  limit?: number
  offset?: number
}
export interface MerchandiseUseCase {
  listItem(input: MerchandiseListItemInput, ...options: OperationOption[]): Promise<PaginationResult<Asset>>
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
    return this.Asset.findMany(
      WithPagination(limit, offset),
      WithOperationOwner(option.operationOwnerId)
    )
  }
}