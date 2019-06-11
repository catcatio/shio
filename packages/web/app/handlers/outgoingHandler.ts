import { OutgoingMessage } from '@shio-bot/foundation/entities'
import { LineMessageClientSendMessageInput, MessagingClientProvider } from '@shio-bot/chatengine/types'
import { FulfillmentListener } from '../types'

export const fulfillmentMessageHandler = (messagingClientProvider: MessagingClientProvider): FulfillmentListener => {
  return async (message: OutgoingMessage): Promise<void> => {
    console.log('OutgoingMessage', JSON.stringify(message))

    let input: LineMessageClientSendMessageInput = {
      provider: 'line',
      replyToken: message.replyToken || '',
      to: message.source.userId,
      text: JSON.stringify(message)
    }

    try {
      let messagingClient = messagingClientProvider.get(message.provider)
      let result = await messagingClient.sendMessage(input).catch(err => console.error(err))
      console.log(result)
    } catch (err) {
      console.error(err)
    }
  }
}
