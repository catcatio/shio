

interface AssetMetadataBook {
    kind: 'AssetMetadataBook'
    coverImageURL: string
    title: string
    description: string
    teaser: string
}

interface AssetMetadataEvent {
    kind: 'AssetMetadataEvent'
    eventURL: string
}

type AssetMetadata = AssetMetadataBook | AssetMetadataEvent

interface Asset {
  id: string
  aclTag: string

  // gs://[bucket_name]/book1
  // https://staging.reeeeed.com/book/1
  describeURL: string
  meta: AssetMetadata
  price: number
}