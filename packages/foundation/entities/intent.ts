import { AssetMetadata } from './asset'
import * as Joi from 'joi'
import { MessageProvider } from './message'
import { join } from 'path'
import { NarrowUnion } from '../../fulfillment/app/endpoints/default';

function JoiKind(kind: string) {
  return Joi.string()
    .only(kind)
    .required()
}

export const WhoMessageIntentKind = 'who'
export const WhoMessageIntentSchema = Joi.object().keys({
  name: Joi.string()
    .only(WhoMessageIntentKind)
    .required(),
  parameters: Joi.object().keys({})
})
export interface WhoMessageIntent {
  name: typeof WhoMessageIntentKind
  parameters: {}
}
export const WhoMessageFulfilmentKind = 'who-fufillment'
export interface WhoMessageFulfillment {
  name: typeof WhoMessageFulfilmentKind
  parameters: {
    id: string
    provider: MessageProvider
    providerId: string
    userId: string
    displayName: string
  }
}

export const DescribeItemMessageIntentKind = 'describe-item'
export const DescribeItemMessageIntentSchema = Joi.object().keys({
  name: JoiKind(DescribeItemMessageIntentKind),
  parameters: Joi.object().keys({
    id: Joi.string().required()
  })
})
export interface DescribeItemMessageIntent {
  name: typeof DescribeItemMessageIntentKind
  parameters: {
    id: string
  }
}

export const DescribeItemMessageFulfillmentKind = 'describe-item'
export interface DescribeItemMessageFulfillment {
  name: typeof DescribeItemMessageFulfillmentKind
  parameters: {
    id: string
    asset: AssetMetadata
  }
}

export const GetItemDownloadUrlEventMessageIntentKind = 'get-item-download-url'
export const GetItemDownloadUrlEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string()
    .only(GetItemDownloadUrlEventMessageIntentKind)
    .required(),
  parameters: Joi.object()
    .keys({
      assetId: Joi.string().required()
    })
    .required()
})
export interface GetItemDownloadUrlEventMessageIntent {
  name: typeof GetItemDownloadUrlEventMessageIntentKind
  parameters: {
    assetId: string
  }
}
export const GetItemDownloadUrlEventMessageFulfillmentKind = 'get-item-download-url-fulfillment'
export interface GetItemDownloadUrlEventMessageFulfillment {
  name: typeof GetItemDownloadUrlEventMessageFulfillmentKind
  paramters: {
    url: string
  }
}

export enum ListItemEventMessageIntentParameterFilter {
  RECENT = 'recent',
  MOST_VIEWED = 'mostviewed'
}

export const ListItemEventMessageIntentKind = 'list-item'
export const ListItemEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string().only(ListItemEventMessageIntentKind),
  parameters: Joi.object().keys({
    merchantId: Joi.string(),
    limit: Joi.number(),
    offset: Joi.number(),
    filter: Joi.required().allow(Object.keys(ListItemEventMessageIntentParameterFilter).map(e => ListItemEventMessageIntentParameterFilter[e]))
  })
})
export interface ListItemEventMessageIntent {
  name: typeof ListItemEventMessageIntentKind
  parameters: {
    merchantId?: string
    limit?: number // default = 5
    offset?: number // default = 0
    filter: ListItemEventMessageIntentParameterFilter
  }
}

export const ListItemEventMessageFulfillmentKind = 'list-item-fulfillment'
export interface ListItemEventMessageFulfillment {
  name: typeof ListItemEventMessageFulfillmentKind
  parameters: {
    merchantTitle: string
    limit: number
    offset: number
    hasNext: boolean
    hasPrev: boolean
    filter?: ListItemEventMessageIntentParameterFilter
    assets: {
      isOwnByOperationOwner?: boolean
      id: string
      meta: AssetMetadata
      price?: number
      coverImageURL?: string
    }[]
  }
}

export const FollowEventMessageIntentKind = 'follow'
export const FollowEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string()
    .only(FollowEventMessageIntentKind)
    .required(),
  parameters: Joi.object()
    .keys({
      displayName: Joi.string().required()
    })
    .required()
})
export interface FollowEventMessageIntent {
  name: typeof FollowEventMessageIntentKind
  parameters: {
    displayName: string
  }
}

export const UnfollowEventMessageIntentKind = 'unfollow'
export interface UnfollowEventMessageIntent {
  name: typeof UnfollowEventMessageIntentKind
  parameters: {
    reason?: string
  }
}

export const FollowEventMessageFulfillmentKind = 'follow-fulfillment'
export interface FollowEventMessageFulfillment {
  name: typeof FollowEventMessageFulfillmentKind
  parameters: {
    isCompleted: boolean
    isExists: boolean
    userId?: string
    chatSessionId?: string
    description?: string
  }
}
export const ErrorEventMessageFulfillmentKind = 'error-fulfillment'
export interface ErrorEventMessageFulfillment {
  name: typeof ErrorEventMessageFulfillmentKind
  parameters: {
    reason: string
  }
}

export const PurchaseItemEventMessageIntentKind = 'purchase-item'
export interface PurchaseItemEventMessageIntent {
  name: typeof PurchaseItemEventMessageIntentKind
  parameters: {
    assetId: string
  }
}
export const PurchaseItemEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string()
    .only(PurchaseItemEventMessageIntentKind)
    .required(),
  parameters: Joi.object()
    .keys({
      assetId: Joi.string().required()
    })
    .required()
})

export const ClaimFreeItemEventMessageIntentKind = 'claim-free-item'
export interface ClaimFreeItemEventMessageIntent {
  name: typeof ClaimFreeItemEventMessageIntentKind
  parameters: {
    orderId: string
  }
}
export const ClaimFreeItemEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string()
    .only(ClaimFreeItemEventMessageIntentKind)
    .required(),
  parameters: Joi.object()
    .keys({
      orderId: Joi.string().required()
    })
    .required()
})

export const ClaimFreeItemEventMessageFulfillmentKind = 'claim-free-item-completed-fulfillment'
export interface ClaimFreeItemEventMessageFulfillment {
  name: typeof ClaimFreeItemEventMessageFulfillmentKind
  parameters: {
    assetId: string,
    productName: string
    productDescription?: string
    productImageUrl?: string
  }
}

export type MessageIntent =
  | FollowEventMessageIntent
  | UnfollowEventMessageIntent
  | ListItemEventMessageIntent
  | GetItemDownloadUrlEventMessageIntent
  | WhoMessageIntent
  | PurchaseItemEventMessageIntent
  | DescribeItemMessageIntent
  | ClaimFreeItemEventMessageIntent

export type MessageFulfillment =
  | FollowEventMessageFulfillment
  | ErrorEventMessageFulfillment
  | ListItemEventMessageFulfillment
  | GetItemDownloadUrlEventMessageFulfillment
  | WhoMessageFulfillment
  | DescribeItemMessageFulfillment
  | ClaimFreeItemEventMessageFulfillment

export function isIntentOfKind<K extends MessageIntent['name']>(name: K, value: any): value is NarrowUnion<MessageIntent, K> {
  if (!value) return false
  if (value['name'] === name) return true
  return false
}

export function isFulfillmentOfKind<K extends MessageFulfillment['name']>(name: K, value: any): value is NarrowUnion<MessageFulfillment, K> {
  if (!value) return false
  if (value['name'] === name) return true
  return false
}

export function validateMessageIntent(intent: any): { value: MessageIntent; error: Joi.ValidationError } {
  return Joi.alternatives([
    ListItemEventMessageIntentSchema,
    FollowEventMessageIntentSchema,
    GetItemDownloadUrlEventMessageIntentSchema,
    WhoMessageIntentSchema,
    DescribeItemMessageIntentSchema,
    PurchaseItemEventMessageIntentSchema,
    ClaimFreeItemEventMessageIntentSchema
  ]).validate(intent)
}
