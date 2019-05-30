import { IncomingMessage, OutgoingMessage } from '../entities'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'

export const PUBSUB_INCOMING_MESSAGE_TOPIC = 'shio-incoming-message'
export const PUBSUB_FULLFILLMENT_SUBSCRIPTION = 'shio-fullfillment-service'
export const PUBSUB_OUTGOING_MESSAGE_TOPIC = 'shio-outgoing-message'
export const PUBSUB_OUTGOING_SUBSCRIPTION = 'shio-outgoing-subscription'

export interface PublishIncommingMessageInput extends IncomingMessage {}
export type SubscribeIncomingMessageListener = (message: IncomingMessage, acknowledge: () => void) => Promise<void> | void

export interface PublishOutgoingMessageInput extends OutgoingMessage {}
export type SubscribeOutgoingMessageListener = (message: OutgoingMessage, acknowledge: () => void) => Promise<void> | void

export interface PubsubTransport {
  PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void>
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void
  UnsubscribeAllIncomingMessage(): void

  PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void>
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void
  UnsubscribeAllOutgoingMessage(): void
}

export class CloudPubsubTransport implements PubsubTransport {
  private pubsub: PubSub
  public incomingTopic: Topic
  public incomingSubscription: Subscription
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
    this.incomingTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.outgoingTopic = this.pubsub.topic(PUBSUB_OUTGOING_MESSAGE_TOPIC)
    await Promise.all([this.incomingTopic.get({ autoCreate: true }), this.outgoingTopic.get({ autoCreate: true })])

    this.incomingSubscription = this.incomingTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    this.outgoingSubscription = this.outgoingTopic.subscription(PUBSUB_OUTGOING_SUBSCRIPTION)
    await Promise.all([this.incomingSubscription.get({ autoCreate: true }), this.outgoingSubscription.get({ autoCreate: true })])
  }

  // purge method will remove subscription channel of
  // incoming and outgoing message and create new one
  // please aware that you need to re subscribe the subscription
  // channel again after purge
  async purge() {

    this.UnsubscribeAllIncomingMessage()
    this.UnsubscribeAllOutgoingMessage()

    if(await this.incomingTopic.exists()[0] && await this.incomingSubscription.exists()[0]) {
      await this.incomingSubscription.delete()
    }

    if (await this.outgoingTopic.exists()[0] && await this.outgoingSubscription.exists()[0]) {
      await this.outgoingSubscription.delete()
    }
    await this.prepare()
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
      const f = listener({ ...data }, () => {
        message.ack()
      })
      if (f && typeof f.then === 'function') {
        f.then()
      }
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
      const f = listener({ ...data }, () => {
        message.ack()
      })
      if (f && typeof f.then === 'function') {
        f.then()
      }
    })
  }
}
