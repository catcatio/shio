export * from '@shio-bot/foundation/entities'
import { AssetMetadata } from "@shio-bot/foundation/entities";
import { CommonAttributes } from '@shio-bot/foundation';



export interface Asset extends CommonAttributes {
  id: string
  aclTag: string
  merchantId?: string

  // gs://[bucket_name]/book1
  // https://staging.reeeeed.com/book/1
  describeURL: string
  price?: number
  meta: AssetMetadata
}