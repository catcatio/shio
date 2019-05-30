
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

export type MessageIntent = FollowEventMessageIntent | UnfollowEventMessageIntent
export type MessageFulfillment = FollowEventMessageFulfillment | ErrorEventMessageFulfillment
