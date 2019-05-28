import { IncomingMessage, OutgoingMessage } from '../entities'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'

export const PUBSUB_INCOMING_MESSAGE_TOPIC = 'shio-incoming-message'
export const PUBSUB_FULLFILLMENT_SUBSCRIPTION = 'shio-fullfillment-service'
export const PUBSUB_OUTGOING_MESSAGE_TOPIC = 'shio-outgoing-message'
export const PUBSUB_OUTGOING_SUBSCRIPTION = 'shio-outgoing-subscription'

interface PublishIncommingMessageInput extends IncomingMessage {}
type SubscribeIncomingMessageListener = (message: IncomingMessage, acknowledge: () => void) => Promise<void> | void

interface PublishOutgoingMessageInput extends OutgoingMessage {}
type SubscribeOutgoingMessageListener = (message: OutgoingMessage, acknowledge: () => void) => Promise<void> | void

export interface CloudPubsubTransports {
  PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void>
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void
  UnsubscribeAllIncomingMessage(): void

  PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void>
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void
  UnsubscribeAllOutgoingMessage(): void
}

export class CloudPubsubTransports implements CloudPubsubTransports {
  private pubsub: PubSub
  private incomingTopic: Topic
  private incomingSubscription: Subscription
  private outgoingTopic: Topic
  private outgoingSubscription: Subscription

  private serviceName: string
  constructor(pubsub: PubSub, serviceName: string) {
    this.pubsub = pubsub
    this.serviceName = serviceName
    this.incomingTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.incomingSubscription = this.incomingTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    this.outgoingTopic = this.pubsub.topic(PUBSUB_OUTGOING_MESSAGE_TOPIC)
    this.outgoingSubscription = this.outgoingTopic.subscription(PUBSUB_OUTGOING_SUBSCRIPTION)
  }

  async prepare() {
    const incomingMessageTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    const incomingMessageSubscription = incomingMessageTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    const outgoingMessageTopic = this.pubsub.topic(PUBSUB_OUTGOING_MESSAGE_TOPIC)
    const outogingMessageSubscription = outgoingMessageTopic.subscription(PUBSUB_OUTGOING_SUBSCRIPTION)
    await Promise.all([
      incomingMessageTopic.get({ autoCreate: true }),
      incomingMessageSubscription.get({ autoCreate: true }),
      outgoingMessageTopic.get({ autoCreate: true }),
      outogingMessageSubscription.get({ autoCreate: true })
    ])
    return {
      incomingMessageTopic,
      incomingMessageSubscription,
      outgoingMessageTopic,
      outogingMessageSubscription
    }
  }

  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    await this.incomingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.incomingSubscription.on('message', (message: Message) => {
      const data = JSON.parse(message.data.toString('utf-8'))
      message.ack()
      // const f = listener({ ...data })
      // if (f && typeof f.then === 'function') {
      //   f.then()
      // }
    })
  }

  UnsubscribeAllIncomingMessage(): void {
    this.incomingSubscription.removeAllListeners('message')
  }

  async PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void> {
    await this.outgoingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }
  UnsubscribeAllOutgoingMessage(): void {
    this.outgoingSubscription.removeAllListeners('message')
  }
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void {
    this.outgoingSubscription.on('message', function(message: Message) {
      const data = JSON.parse(message.data.toString('utf-8'))
      const f = listener({ ...data }, message.ack.bind(this))
      if (f && typeof f.then === 'function') {
        f.then()
      }
    })
  }
}
