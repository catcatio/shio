import { Asset } from "../entities/asset";
import { PaginationResult } from "@shio/foundation/entities";



export interface AssetRepository {
  CreateAsset(): Promise<Asset>
  RemoveAsset(): Promise<number>
  FindOneAsset(): Promise<Asset | undefined>
  FindOneAssetOrThrow(): Promise<Asset>
  FindManyAsset(): Promise<PaginationResult<Asset>>
}