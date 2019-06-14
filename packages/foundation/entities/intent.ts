import { AssetMetadata } from './asset'
import * as Joi from 'joi'
import { MessageProvider } from "./message";

function JoiKind(kind: string) {
  return Joi.string().only(kind).required()
}

export const WhoMessageIntentKind = 'who'
export const WhoMessageIntentSchema = Joi.object().keys({
  name: Joi.string().only(WhoMessageIntentKind).required(),
  parameters: Joi.object().keys({})
})
export interface WhoMessageIntent {
  name: typeof WhoMessageIntentKind
  parameters: {}
}
export const WhoMessageFulfilmentKind = 'who'
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
    id: Joi.string().required(),
  })
})
export interface DescribeItemMessageIntent {
  name: typeof DescribeItemMessageIntentKind
  parameters: {
    id: string
  }
}

export const DescribeItemMessageFulfillmentKind = 'describe-item'
export interface DescribeItemMessageFulfillment{
  name: typeof DescribeItemMessageFulfillmentKind
  parameters: {
    id: string
    asset: AssetMetadata
  }
}

export const GetItemDownloadUrlEventMessageIntentKind = 'get-item-download-url'
export const GetItemDownloadUrlEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string().only(GetItemDownloadUrlEventMessageIntentKind).required(),
  parameters: Joi.object().keys({
    assetId: Joi.string().required(),
  }).required()
})
export interface GetItemDownloadUrlEventMessageIntent {
  name: typeof GetItemDownloadUrlEventMessageIntentKind
  parameters: {
    assetId: string
  }
}
export const GetItemDownloadUrlEventMessageFulfillmentKind = 'get-item-download-url'
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

export const ListItemEventMessageFulfillmentKind = 'list-item'
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
      id: string
      meta: AssetMetadata
      price?: number
    }[]
  }
}

export const FollowEventMessageIntentKind = 'follow'
export const FollowEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string().only(FollowEventMessageIntentKind).required(),
  parameters: Joi.object().keys({
    displayName: Joi.string().required(),
  }).required()
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

export const FollowEventMessageFulfillmentKind = 'follow'
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
export const ErrorEventMessageFulfillmentKind = 'error'
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
    merchantTitle: string
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

export type MessageFulfillment =
  | FollowEventMessageFulfillment
  | ErrorEventMessageFulfillment
  | ListItemEventMessageFulfillment
  | GetItemDownloadUrlEventMessageFulfillment
  | WhoMessageFulfillment
  | DescribeItemMessageFulfillment

export function validateMessageIntent(intent: any): { value: MessageIntent, error: Joi.ValidationError } {
  return Joi.alternatives([
    ListItemEventMessageIntentSchema,
    FollowEventMessageIntentSchema,
    GetItemDownloadUrlEventMessageIntentSchema,
    WhoMessageIntentSchema,
    DescribeItemMessageIntentSchema
  ]).validate(intent)

}

