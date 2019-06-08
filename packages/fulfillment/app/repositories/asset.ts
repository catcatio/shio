import { Asset } from '../entities/asset'
import { PaginationResult } from '@shio-bot/foundation/entities'
import { PartialCommonAttributes, Omit } from '../entities'
import { Datastore } from '@google-cloud/datastore'
import { DatastoreBaseRepository, RepositoryOperationOption, composeRepositoryOptions, WithSystemOperation } from './common'
import { toJSON, applyFilter } from '../helpers/datastore'

export type AssetRepositoryOperationOption = RepositoryOperationOption<Asset>
export type CreateAssetInput = Omit<PartialCommonAttributes<Asset>, 'id' | 'aclTag'> & { id?: string }

export interface AssetRepository {
  create(input: CreateAssetInput): Promise<Asset>
  remove(): Promise<number>
  findOne(...options: AssetRepositoryOperationOption[]): Promise<Asset | undefined>
  findMany(...options: AssetRepositoryOperationOption[]): Promise<PaginationResult<Asset>>
}

export class DatastoreAssetRepository extends DatastoreBaseRepository implements AssetRepository {
  private AssetKind = 'asset'
  constructor(db: Datastore) {
    super(db)
    this.db = db
  }

  async create(input: CreateAssetInput): Promise<Asset> {
    let assetKey: any
    if (input.id) {
      assetKey = this.db.key([this.AssetKind, input.id])
    } else {
      assetKey = await this.allocateKey(this.AssetKind)
    }
    await this.db.upsert({
      key: assetKey,
      data: input
    })
    const [entities] = await this.db.get(assetKey)
    return toJSON(entities)
  }
  async remove(...options: AssetRepositoryOperationOption[]): Promise<number> {
    const assets = await this.findMany(...options, WithSystemOperation())
    await Promise.all(assets.records.map(async asset => {
      return this.db.delete(this.db.key([this.AssetKind, this.parseIdToDatastoreId(asset.id)]))
    }))
    return assets.records.length
  }
  async findOne(...options: AssetRepositoryOperationOption[]): Promise<Asset | undefined> {
    const option = composeRepositoryOptions(...options)
    const query = applyFilter(this.db.createQuery(this.AssetKind), option)
    const results = await this.runQuery(query)
    if (results.length < 1) {
      return undefined
    }
    return toJSON(results[0])
  }
  async findMany(...options: AssetRepositoryOperationOption[]): Promise<PaginationResult<Asset>> {
    const option = composeRepositoryOptions(...options)
    const query = applyFilter(this.db.createQuery(this.AssetKind), option)
    const results = await this.runQuery(query)
    return {
      records: results.map(r => toJSON(r)),
      limit: option.limit,
      offset: option.offset
    }
  }
}
