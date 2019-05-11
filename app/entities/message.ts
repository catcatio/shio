



// Pubsub queue waiting for fullfillment
export interface IncomingMessage {
  provider: 'line'
  providerId: string
  replyToken: string
  originalContext: string
  intent: string
  params: {
    [key: string]: string
  }
}

// Pubsub queue for reply
export enum OutgoingMessageType {
  text,
  image,
  carousel
}

export interface OutgoingMessage {
  replyToken: string
  type: OutgoingMessageType
}