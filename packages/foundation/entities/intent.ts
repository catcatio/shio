import { AssetMetadata } from './asset'
import * as Joi from 'joi'

export enum ListItemEventMessageIntentParameterFilter {
  RECENT = 'recent',
  MOST_VIEWED = 'mostviewed'
}

export const ListItemEventMessageIntentKind = 'list-item'
export const ListItemEventMessageIntentSchema = Joi.object().keys({
  name: Joi.string().allow(ListItemEventMessageIntentKind),
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
  name: FollowEventMessageIntentKind,
  parameters: Joi.object().keys({
    displayName: Joi.string().required()
  })
})
export interface FollowEventMessageIntent {
  name: typeof FollowEventMessageIntentKind
  parameters: {
    displayName: string
  }
}

const UnfollowEventMessageIntentKind = 'unfollow'
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

export type MessageIntent = FollowEventMessageIntent | UnfollowEventMessageIntent | ListItemEventMessageIntent | PurchaseItemEventMessageIntent

export type MessageFulfillment = FollowEventMessageFulfillment | ErrorEventMessageFulfillment | ListItemEventMessageFulfillment

export function validateMessageIntent(message: any): { value: MessageIntent; error: Joi.ValidationError } {
  return Joi.validate(message, Joi.alternatives().try(ListItemEventMessageIntentSchema, FollowEventMessageIntentSchema))
}
