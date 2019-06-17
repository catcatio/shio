import {
  FollowEventMessageIntent,
  FollowEventMessageFulfillment,
  MessageIntent,
  MessageFulfillment,
  ListItemEventMessageIntent,
  ListItemEventMessageIntentKind,
  ListItemEventMessageIntentParameterFilter,
  PurchaseItemEventMessageIntent,
  FollowEventMessageFulfillmentKind,
  FollowEventMessageIntentKind
} from '../intent'
import { IncomingMessage, OutgoingMessage } from '../message'
import { ulid } from 'ulid'
import * as uuid from 'uuid/v4'
import { ReservePaymentMessage, ConfirmPaymentMessage } from '../payment'

export function randomListItemEventMessageIntent(): ListItemEventMessageIntent {
  return {
    name: ListItemEventMessageIntentKind,
    parameters: {
      filter: ListItemEventMessageIntentParameterFilter.MOST_VIEWED,
      limit: 10,
      offset: 0,
      merchantId: 'random-marchant-id'
    }
  }
}

export function randomFollowMessageIntent(): FollowEventMessageIntent {
  return {
    name: FollowEventMessageIntentKind,
    parameters: {
      displayName: 'AIM'
    }
  }
}
export function randomFollowMessageFulfillment(): FollowEventMessageFulfillment {
  return {
    name: FollowEventMessageFulfillmentKind,
    parameters: {
      isExists: false,
      isCompleted: true,
      chatSessionId: 'random-chat-session-id',
      userId: 'random-user-id'
    }
  }
}
export function randomPurchaseItemIntent(): PurchaseItemEventMessageIntent {
  return {
    name: 'purchase-item',
    parameters: {
      assetId: 'spongebob squarepants'
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
    type: FollowEventMessageIntentKind,
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
      type: 'user'
    },
    requestId: ulid().toString()
  }
}

export function randomReservePaymentMessage(): ReservePaymentMessage {
  return {
    type: 'ReservePayment',
    provider: 'linepay',
    orderId: uuid().toString(),
    productName: 'spongebob squarepants',
    productImageUrl: 'http://example.com/spongebob_squarepants',
    amount: 300.123,
    currency: 'THB'
  }
}

export function randomConfirmPaymentMessage(): ConfirmPaymentMessage {
  return {
    type: 'ConfirmPaymentResult',
    provider: 'linepay',
    orderId: uuid().toString(),
    transactionId: uuid().toString(),
    amount: 300.123,
    currency: 'THB',
    isCompleted: true
  }
}
