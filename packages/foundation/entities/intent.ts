import { AssetMetadata } from "./asset";


export enum ListItemEventMessageIntentParameterFilter {
  RECENT,
  MOST_VIEWED,
}

export const ListItemEventMessageIntentKind = 'list-item'
export interface ListItemEventMessageIntent {
  name: typeof ListItemEventMessageIntentKind
  parameters: {
    merchantId: string
    limit: number // default = 5
    offset: number // default = 0
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
export interface FollowEventMessageIntent {
  name: typeof FollowEventMessageIntentKind
  parameters: {
    displayName: string
  }
}

const UnfollowEventMessageIntentKind = 'unfollow'
export interface UnfollowEventMessageIntent {
  name: typeof UnfollowEventMessageIntentKind,
  parameters: {
    reason?: string
  }
}

export const FollowEventMessageFulfillmentKind = 'follow'
export interface FollowEventMessageFulfillment {
  name: typeof FollowEventMessageFulfillmentKind
  parameters: {
    isCompleted: boolean
    userId?: string
    chatSessionId?: string
    description?: string
  }
}
export const ErrorEventMessageFulfillmentKind = 'error'
export interface ErrorEventMessageFulfillment {
  name: typeof ErrorEventMessageFulfillmentKind,
  parameters: {
    reason: string
  }
}

export type MessageIntent =
  | FollowEventMessageIntent
  | UnfollowEventMessageIntent
  | ListItemEventMessageIntent

export type MessageFulfillment =
  | FollowEventMessageFulfillment
  | ErrorEventMessageFulfillment
  | ListItemEventMessageFulfillment
