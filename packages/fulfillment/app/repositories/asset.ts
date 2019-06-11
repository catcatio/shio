import { Asset } from '../entities/asset'
import { PaginationResult, AssetMetadataBookKind } from '@shio-bot/foundation/entities'
import { PartialCommonAttributes, Omit, newResourceTag } from '../entities'
import { Datastore } from '@google-cloud/datastore'
import { DatastoreBaseRepository, OperationOption, composeOperationOptions, WithSystemOperation } from './common'
import { toJSON, applyFilter } from '../helpers/datastore'
import { ACLRepository } from './acl';
import { tags } from 'joi';
import { entity } from '@google-cloud/datastore/build/src/entity';
import { FileStorage } from '@shio-bot/foundation';
import { newGlobalError, ErrorType } from '../entities/error';
import { join } from 'path';

export type AssetRepositoryOperationOption = OperationOption<Asset>
export type CreateAssetInput = Omit<PartialCommonAttributes<Asset>, 'id' | 'aclTag'> & { id?: string }

export interface AssetRepository {
  AssetStorage: AssetStorageRepository
  create(input: CreateAssetInput): Promise<Asset>
  remove(): Promise<number>
  findById(id: string, ...options: AssetRepositoryOperationOption[]): Promise<Asset | undefined>
  findOne(...options: AssetRepositoryOperationOption[]): Promise<Asset | undefined>
  findMany(...options: AssetRepositoryOperationOption[]): Promise<PaginationResult<Asset>>
}

class AssetStorageRepository {
  private Storage: FileStorage
  constructor(storage: FileStorage) {
    this.Storage = storage
  }

  async getDownloadUrlFromDescribeUrl(describeUrl: string, fileName: string) {
    const url = new URL(describeUrl)
    switch (url.protocol) {
      case 'gs:':
        return this.Storage.GetObjectUrl(join(url.pathname, fileName))
      default:
        throw newGlobalError(ErrorType.Input, `protocol ${url.protocol} not support`)
    }
  }

  async getDownloadUrlFromAsset(asset: Asset, fileName: string, ...options: OperationOption[]): Promise<string> {
    const option = composeOperationOptions(...options)
    option.logger.info(`get downloadable url for asset Id ${asset.id}`)
    const { meta } = asset
    if (meta.kind === AssetMetadataBookKind) {
      return this.getDownloadUrlFromDescribeUrl(asset.describeURL, fileName)
    } else {
      throw newGlobalError(ErrorType.Input, `asset type ${asset.meta.kind} not support downloadable content`)
    }

  }

}

export class DatastoreAssetRepository extends DatastoreBaseRepository implements AssetRepository {

  private AssetKind = 'asset'
  private tag = newResourceTag('asset')
  public AssetStorage: AssetStorageRepository
  constructor(db: Datastore, storage: FileStorage) {
    super(db)
    this.db = db
    this.AssetStorage = new AssetStorageRepository(storage)
  }

  async findById(id: string, ...options: OperationOption<Asset>[]): Promise<Asset | undefined> {
    const option = composeOperationOptions(...options)
    const k = this.db.key([this.AssetKind, this.parseIdToDatastoreId(id)])
    const asset = await this.getByKey(k)
    return toJSON(asset)
  }

  async create(input: CreateAssetInput, ...options: OperationOption[]): Promise<Asset> {
    const option = composeOperationOptions(...options)
    let assetKey: entity.Key
    if (input.id) {
      assetKey = this.db.key([this.AssetKind, input.id])
    } else {
      assetKey = await this.allocateKey(this.AssetKind)
    }
    const { id } = this.getIdFromKey(assetKey)
    const aclTag = this.tag.withId(id).toString()
    option.logger.withFields({ title: input.meta.title, kind: input.meta.kind }).info(`creating new asset  (${assetKey.kind}${assetKey.id})`)
    input.createdAt = new Date()
    await this.db.upsert({
      key: assetKey,
      data: {
        ...input,
        aclTag,
      } as Asset
    })
    const [entities] = await this.db.get(assetKey)
    return toJSON(entities)
  }
  async remove(...options: AssetRepositoryOperationOption[]): Promise<number> {
    const option = composeOperationOptions(...options)
    option.logger.info('remove asset...')
    const assets = await this.findMany(...options, WithSystemOperation())
    await Promise.all(assets.records.map(async asset => {
      return this.db.delete(this.db.key([this.AssetKind, this.parseIdToDatastoreId(asset.id)]))
    }))
    return assets.records.length
  }
  async findOne(...options: AssetRepositoryOperationOption[]): Promise<Asset | undefined> {
    const option = composeOperationOptions(...options)
    const query = applyFilter(this.db.createQuery(this.AssetKind), option)
    const results = await this.runQuery(query)
    if (results.length < 1) {
      return undefined
    }
    return toJSON(results[0])
  }
  async findMany(...options: AssetRepositoryOperationOption[]): Promise<PaginationResult<Asset>> {
    const option = composeOperationOptions(...options)
    const query = applyFilter(this.db.createQuery(this.AssetKind), option)
    const results = await this.runQuery(query)
    return {
      records: results.map(r => toJSON(r)),
      limit: option.limit,
      offset: option.offset
    }
  }
}
