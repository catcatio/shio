import { CreateAssetInput } from "../repositories/asset";
import { AssetMetadata, AssetMetadataBookKind } from "@shio-bot/foundation/entities";
import { v1 } from 'uuid'
export function randomAssetMetadata(): AssetMetadata {
  return {
    coverImageURL:"gs://somewhere",
    description: "hey rick",
    kind: AssetMetadataBookKind,
    teaser: "Mortyy",
    title: "Rick and Morty"
  }
}

export function randomCreateAssetInput(meta: AssetMetadata): CreateAssetInput {
  return {
    meta: meta,
    describeURL: "gs://somewhere",
    merchantId: v1().toString()
  }
}