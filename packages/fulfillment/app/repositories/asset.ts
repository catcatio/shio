import { Asset } from "../entities/asset";
import { PaginationResult } from "../entities/common";



export interface AssetRepository {
  CreateAsset(): Promise<Asset>
  RemoveAsset(): Promise<number>
  FindOneAsset(): Promise<Asset | undefined>
  FindOneAssetOrThrow(): Promise<Asset>
  FindManyAsset(): Promise<PaginationResult<Asset>>
}