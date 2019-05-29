

export interface FollowEventMessageIntent {
  name: 'follow'
  parameters: { 
    displayName: string
  }
}

export interface UnfollowEventMessageIntent {
  name: 'unfollow',
  parameters: {
    reason?: string
  }
}
export interface FollowEventMessageFulfillment {
  name: 'follow'
  parameters: {
    isCompleted: boolean
    userId?: string
    chatSessionId?: string
    description?: string
  }
}

export interface ErrorEventMessageFulfillment {
  name: 'error',
  parameters: {
    reason: string
  }
}

export type MessageIntent = FollowEventMessageIntent | UnfollowEventMessageIntent
export type MessageFulfillment = FollowEventMessageFulfillment | ErrorEventMessageFulfillment
