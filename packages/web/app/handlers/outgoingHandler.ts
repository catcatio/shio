import { OutgoingMessage } from '@shio-bot/foundation/entities'
import { MessagingClientProvider, MessageClientSendCustomMessagesInput } from '@shio-bot/chatengine/types'
import { FulfillmentListener, MessageFulfillmentParserList } from '../types'
import { Message } from '@line/bot-sdk'

type ChatProviderMessageFulfillmentParser = {
  line: () => MessageFulfillmentParserList<Message>
  facebook: () => MessageFulfillmentParserList<any>
}

export const fulfillmentMessageHandler = (messagingClientProvider: MessagingClientProvider, fulfillmentParser: ChatProviderMessageFulfillmentParser): FulfillmentListener => {
  return async (message: OutgoingMessage): Promise<void> => {
    console.log('OutgoingMessage', JSON.stringify(message))
    let messagingClient = messagingClientProvider.get(message.provider)
    let messageParser = fulfillmentParser[message.provider]()

    let messages: unknown[] = []
    message.fulfillment.forEach(f => {
      const parseFn = messageParser[f.name]
      if (typeof parseFn !== 'function') {
        console.error(`Parser function not found\nonly ${Object.keys(messageParser).join(',')} is avaliable for ${message.provider}`)
        return
      }
      messages.push(parseFn(f as any))
    })

    if (message.provider !== 'line') {
      throw Error('unsupport fulfilment message provider')
    }

    let input: MessageClientSendCustomMessagesInput = {
      provider: message.provider,
      replyToken: message.replyToken || '',
      to: message.source.userId,
      message: messages
    }

    try {
      let result = await messagingClient.sendCustomMessages(input).catch(err => console.error(err))
      console.log(result)
    } catch (err) {
      console.error(err)
    }
  }
}
