import { IncomingMessage } from '../entities'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'

export const PUBSUB_INCOMING_MESSAGE_TOPIC = 'shio-incoming-message'
export const PUBSUB_FULLFILLMENT_SUBSCRIPTION = 'shio-fullfillment-service'

interface PublishIncommingMessageInput extends IncomingMessage {}
type SubscribeIncomingMessageListener = (message: IncomingMessage) => Promise<void> | void

export interface CloudPubsubTransports {
  PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void>
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void
  UnsubscribeAllIncomingMessage(): void
}

export class CloudPubsubTransports implements CloudPubsubTransports {
  private pubsub: PubSub
  private topic: Topic
  private subscription: Subscription
  constructor(pubsub: PubSub) {
    this.pubsub = pubsub
    this.topic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.subscription = this.topic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
  }

  async preparePubsubTopicAndSubscription() {
    const incomingMessageTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    const incomingMessageSubscription = incomingMessageTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    await Promise.all([incomingMessageTopic.get({ autoCreate: true }), incomingMessageSubscription.get({ autoCreate: true })])
    return {
      incomingMessageTopic,
      incomingMessageSubscription
    }
  }

  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    await this.topic.publishJSON({
      ...input
    })
  }

  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.subscription.on('message', (message: Message) => {
      const data = JSON.parse(message.data.toString('utf-8'))
      const f = listener({ ...data })
      if (f && typeof f.then === 'function') {
        f.then(() => message.ack())
      } else {
        message.ack()
      }
    })
  }

  UnsubscribeAllIncomingMessage(): void {
    this.subscription.removeAllListeners('message')
  }

  PublishOutgoingMessage() {}
  SubscribeOutgoingMessage() {}
}
