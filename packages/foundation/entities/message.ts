import { MessageIntent, MessageFulfillment } from './intent'

export interface GroupIncomingMessageSource {
  userId: string
  groupId: string
  type: 'group'
}

export interface RoomIncomingMessageSource {
  userId: string
  roomId: string
  type: 'room'
}
export interface UserIncomingMessageSource {
  userId: string
  type: 'user'
}

export type IncommingMessageSource = UserIncomingMessageSource | RoomIncomingMessageSource | GroupIncomingMessageSource
export type IncommingMessageType =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'audioMessage'
  | 'fileMessage'
  | 'locationMessage'
  | 'stickerMessage'
  | 'follow'
  | 'unfollow'
  | 'postback'
  | 'join'
  | 'leave'
  | 'postback'
  | 'beacon'
  | 'accountLink'
  | 'unknown'

export type MessageProvider = 'line' | 'facebook'
export type MessageLanguageCode = 'th' | 'en'

export interface IncomingMessage {
  intent: MessageIntent
  provider: MessageProvider
  replyToken?: string
  languageCode: MessageLanguageCode

  type: IncommingMessageType
  source: IncommingMessageSource
  timestamp: number
  original: any

  requestId: string
}

export interface OutgoingMessage {
  fulfillment: MessageFulfillment[]
  provider: MessageProvider
  replyToken?: string
  languageCode: MessageLanguageCode
  source: IncommingMessageSource

  requestId: string
}

export function createOutgoingFromIncomingMessage(incoming: IncomingMessage, fulfillment: MessageFulfillment | MessageFulfillment[]): OutgoingMessage {

  if(!Array.isArray(fulfillment)) {
    fulfillment = [fulfillment]
  }
  return {
    fulfillment,
    ...incoming,
  }

}