import { Asset, PaginationResult } from "../entities/asset";
import { ACLRepository, UserRepository, WithOperationOwner, WithPagination, WithSystemOperation } from "../repositories";
import { AssetRepository } from "../repositories/asset";


interface MerchandiseListItemInput {
  userId: string
  merchandiseId?: string
  limit?: number
  offset?: number
}
export interface MerchandiseUseCase {
  listItem(input: MerchandiseListItemInput): Promise<PaginationResult<Asset>>
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
  public async listItem({ limit, merchandiseId, offset, userId }: MerchandiseListItemInput): Promise<PaginationResult<Asset>> {
    return this.Asset.findMany(
      WithPagination(limit, offset),
      WithOperationOwner(userId)
    )
  }
}