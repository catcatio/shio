import { createDatastoreInstance, WithDatastoreAPIEndpoint } from "@shio-bot/foundation";
import { LocalDatastoreEndpoint } from "../../helpers/datastore";
import { DatastoreAssetRepository } from "../asset";
import { AssetMetadataBookKind, Asset } from "../../entities/asset";
import { WithWhere } from "../common";
import { randomCreateAssetInput, randomAssetMetadata } from "../../helpers/random";

describe('Asset', () => {

  let assetRepository: DatastoreAssetRepository
  beforeAll(async () => {
    const datastore = await createDatastoreInstance(WithDatastoreAPIEndpoint(LocalDatastoreEndpoint))
    assetRepository = new DatastoreAssetRepository(datastore)
  })

  test('basic operation', async () => {
    const assetMeta = randomAssetMetadata()
    const assetInput = randomCreateAssetInput(assetMeta)
    const assetResult = await assetRepository.create(assetInput)

    expect(assetResult).toBeDefined()
    expect(assetResult.meta.kind).toEqual(AssetMetadataBookKind)

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