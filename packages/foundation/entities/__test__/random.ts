import { FollowEventMessageIntent, FollowEventMessageFulfillment, MessageIntent } from '../intent'
import { IncomingMessage } from '../message'
import * as uuid from 'uuid/v4'

export function randomFollowMessageIntent(): FollowEventMessageIntent {
  return {
    name: 'follow',
    parameters: {
      displayName: 'AIM'
    }
  }
}
export function randomFollowMessageFulfillment(): FollowEventMessageFulfillment {
  return {
    name: 'follow',
    parameters: {
      isCompleted: true,
      chatSessionId: 'random-chat-session-id',
      userId: 'random-user-id'
    }
  }
}

export function randomIncomingMessage(intent: MessageIntent = randomFollowMessageIntent()): IncomingMessage {
  return {
    intent,
    languageCode: 'th',
    provider: 'line',
    source: {
      userId: uuid().toString(),
      type: 'user'
    },
    timestamp: Date.now(),
    type: 'follow',
    original: {},
    requestId: uuid.toString()
  }
}
