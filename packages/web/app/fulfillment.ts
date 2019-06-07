import { MessageChannelTransport, SubscribeOutgoingMessageListener } from '@shio-bot/foundation'
import { OutgoingMessage, IncomingMessage } from '@shio-bot/foundation/entities'
import { FulfillmentListener, Fulfillment } from './types'

export const fulfillment = (pubsub: MessageChannelTransport): Fulfillment => {
  const onFulfillment = (listener: FulfillmentListener) => {
    let msgListener: SubscribeOutgoingMessageListener = async (message: OutgoingMessage, acknowledge: () => void): Promise<void> => {
      await listener(message)
      acknowledge()
    }

    pubsub.SubscribeOutgoingMessage(msgListener)
  }

  const publishIntent = async (msg: IncomingMessage): Promise<void> => {
    return pubsub.PublishIncommingMessage(msg)
  }

  return {
    onFulfillment,
    publishIntent
  }
}
