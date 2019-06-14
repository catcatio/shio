import {
  OutgoingMessage,
  ListItemEventMessageFulfillmentKind,
  FollowEventMessageFulfillmentKind,
  ErrorEventMessageFulfillmentKind,
  MessageFulfillment
} from '@shio-bot/foundation/entities'
import { LineMessageClientSendMessageInput, MessagingClientProvider, LineMessageClientSendCustomMessagesInput } from '@shio-bot/chatengine/types'
import { FulfillmentListener } from '../types'
import { LineFulfillmentParser } from '../helpers/lineParser'
import { Message } from '@line/bot-sdk'

export const fulfillmentMessageHandler = (messagingClientProvider: MessagingClientProvider): FulfillmentListener => {
  return async (message: OutgoingMessage): Promise<void> => {
    console.log('OutgoingMessage', JSON.stringify(message))
    let messageParser
    if (message.provider === 'line') {
      messageParser = new LineFulfillmentParser()
    }

    let messages: Message[] = []
    message.fulfillment.forEach(f => {
      messages.push(messageParser[f.name](f))
    })

    let input: LineMessageClientSendCustomMessagesInput = {
      provider: 'line',
      replyToken: message.replyToken || '',
      to: message.source.userId,
      message: messages
    }

    try {
      let messagingClient = messagingClientProvider.get(message.provider)
      let result = await messagingClient.sendCustomMessages(input).catch(err => console.error(err))
      console.log(result)
    } catch (err) {
      console.error(err)
    }
  }
}
