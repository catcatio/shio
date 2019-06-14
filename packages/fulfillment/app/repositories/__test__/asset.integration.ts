import { createDatastoreInstance, WithDatastoreAPIEndpoint, LocalFileStorage } from "@shio-bot/foundation";
import { LocalDatastoreEndpoint } from "../../helpers/datastore";
import { DatastoreAssetRepository } from "../asset";
import { AssetMetadataBookKind } from "@shio-bot/foundation/entities";
import { WithWhere } from "../common";
import { randomCreateAssetInput, randomAssetMetadata } from "../../helpers/random";
import { Asset } from "../../entities/asset";

describe('Asset', () => {

  let assetRepository: DatastoreAssetRepository
  beforeAll(async () => {
    const datastore = await createDatastoreInstance(WithDatastoreAPIEndpoint(LocalDatastoreEndpoint))
    const storage = new LocalFileStorage()
    assetRepository = new DatastoreAssetRepository(datastore, storage)
  })

  test('basic operation', async () => {
    const assetMeta = randomAssetMetadata()
    const assetInput = randomCreateAssetInput(assetMeta)
    assetInput.id = "test-asset-01"
    const assetResult = await assetRepository.create(assetInput)

    expect(assetResult).toBeDefined()
    expect(assetResult.meta.kind).toEqual(AssetMetadataBookKind)

    const asset = await assetRepository.findById(assetInput.id)
    expect(asset).toBeDefined()
    expect(asset!.aclTag).toEqual('shio::asset::' + assetInput.id)

    let assets = await assetRepository.findMany(WithWhere<Asset>({
      meta: {
        Equal: {
          title: assetMeta.title
        }
      }
    }))
    expect(assets.records.length).toBeGreaterThanOrEqual(1)

    assets = await assetRepository.findMany(WithWhere<Asset>({
      meta: {
        Equal: {
          title: "Simple2"
        }
      }
    }))
    expect(assets.records.length).toBeGreaterThanOrEqual(0)


    const removedRecords = await assetRepository.remove()
    expect(removedRecords).toBeGreaterThanOrEqual(1)

    assets = await assetRepository.findMany()
    expect(assets.records.length).toEqual(0)
  })

  afterAll(async () => {})

})