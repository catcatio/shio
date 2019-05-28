

interface FollowEventMessageIntent {
  name: 'follow'
  parameters: { 
    displayName: string
  }
}
interface FollowEventMessageFulfillment {
  name: 'follow'
  parameters: {
    isCompleted: boolean
  }
}

interface ErrorEventMessageFulfillment {
  name: 'error',
  parameters: {
    reason: string
  }
}

export type MessageIntent = FollowEventMessageIntent
export type MessageFulfillment = FollowEventMessageFulfillment | ErrorEventMessageFulfillment
