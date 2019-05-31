import { OutgoingMessage } from '@shio-bot/foundation/entities'
import { MessagingClient, LineMessageClientSendMessageInput } from '@shio-bot/chatengine/types'
import { FulfillmentListener } from '../types'

export const fulfillmentMessageHandler = (messagingClient: MessagingClient): FulfillmentListener => {
  return async (message: OutgoingMessage): Promise<void> => {
    console.log(JSON.stringify(message))

    let input: LineMessageClientSendMessageInput = {
      provider: 'line',
      replyToken: message.replyToken || '',
      to: message.source.userId,
      text: JSON.stringify(message)
    }

    let result = await messagingClient.sendMessage(input).catch(err => console.error(err))
    console.log(result)
  }
}
