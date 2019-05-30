import { OutgoingMessage } from "@shio-bot/foundation/entities";
import { SubscribeOutgoingMessageListener } from "@shio-bot/foundation";
import { MessagingClient, LineMessageClientSendMessageInput, LineMessageClientSendMessageOutput } from "@shio-bot/chatengine/types";

export const outgoingMessageHandler = (messagingClient: MessagingClient): SubscribeOutgoingMessageListener => {
  return async (message: OutgoingMessage, acknowledge: () => void): Promise<void> => {
    console.log(JSON.stringify(message))

    let input: LineMessageClientSendMessageInput = {
      provider: 'line',
      replyToken: message.replyToken || '',
      to: message.source.userId,
      text: JSON.stringify(message)
    }
    let output = await messagingClient.sendMessage(input)
      .catch(err => console.error(err))
    console.log(output)
    acknowledge()
  }
}