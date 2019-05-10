



// Pubsub queue waiting for fullfillment
interface IncomingMessage {
  replyToken: string
  originalContext: string
  intent: string
  params: {
    [key: string]: string
  }
}

// Pubsub queue for reply
enum OutgoingMessageType {
  text,
  image,
  carousel
}

interface OutgoingMessage {
  replyToken: string
  type: OutgoingMessageType
}