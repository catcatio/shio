import { FollowEventMessageIntent, FollowEventMessageFulfillment, MessageIntent, MessageFulfillment, ListItemEventMessageIntent, ListItemEventMessageIntentKind, ListItemEventMessageIntentParameterFilter } from '../intent'
import { IncomingMessage, OutgoingMessage } from '../message'
import { ulid } from 'ulid'
import * as uuid from 'uuid/v4'

export function randomListItemEventMessageIntent(): ListItemEventMessageIntent {
  return {
    name:ListItemEventMessageIntentKind,
    parameters: {
      filter: ListItemEventMessageIntentParameterFilter.MOST_VIEWED,
      limit: 10,
      offset: 0,
      merchantId: "random-marchant-id",
    }
  }
}

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
    userProfile: {
      userId: uuid().toString(),
      displayName: `i am ${uuid().toString()}`
    },
    timestamp: Date.now(),
    type: 'follow',
    original: {},
    requestId: ulid().toString()
  }
}

export function randomOutgoingMessage(...fulfillment: MessageFulfillment[]): OutgoingMessage {
  return {
    fulfillment: [...fulfillment],
    languageCode: 'th',
    provider: 'line',
    source: {
      userId: uuid().toString(),
      type: "user"
    },
    requestId: ulid().toString()
  }
}