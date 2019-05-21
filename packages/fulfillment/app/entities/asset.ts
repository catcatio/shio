

export interface AssetMetadataBook {
    kind: 'AssetMetadataBook'
    coverImageURL: string
    title: string
    description: string
    teaser: string
}

export interface AssetMetadataEvent {
    kind: 'AssetMetadataEvent'
    eventURL: string
}

export type AssetMetadata = AssetMetadataBook | AssetMetadataEvent

export interface Asset {
  id: string
  aclTag: string

  // gs://[bucket_name]/book1
  // https://staging.reeeeed.com/book/1
  describeURL: string
  meta: AssetMetadata
  price: number
}