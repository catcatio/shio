import { SubscribeListener, CloudPubsubTransport, CloudPubsubChannelOptions, TopicOptions } from './cloud-pubsub-transport'
import { Router } from 'express'

export interface CloudPubsubDuoChannelTransport<Incoming, Outgoing> {
  PublishIncoming(input: Incoming): Promise<void>
  SubscribeIncoming(listener: SubscribeListener<Incoming>): void

  PublishOutgoing(input: Outgoing): Promise<void>
  SubscribeOutgoing(listener: SubscribeListener<Outgoing>): void

  UnsubscribeAll(): void
}

export interface CloudPubsubDuoChannelManager {
  CreateIncomingSubscriptionConfig(host: string): Promise<void>
  CreateOutgoingSubscriptionConfig(host: string): Promise<void>
  PrepareTopic(): Promise<void>
  Purge(): Promise<void>

  NotificationRouter: Router
}

export abstract class CloudPubsubDuoChannel<Incoming, Outgoing> implements CloudPubsubDuoChannelTransport<Incoming, Outgoing>, CloudPubsubDuoChannelManager {
  public incomingChannel: CloudPubsubTransport<Incoming>
  public outgoingChannel: CloudPubsubTransport<Outgoing>

  constructor(options: CloudPubsubChannelOptions, incomingTopicOptions: TopicOptions, outogingTopicOptions: TopicOptions) {
    this.incomingChannel = new CloudPubsubTransport<Incoming>(options, incomingTopicOptions)
    this.outgoingChannel = new CloudPubsubTransport<Outgoing>(options, outogingTopicOptions)
  }

  public PublishIncoming(input: Incoming): Promise<void> {
    return this.incomingChannel.Publish(input)
  }

  public PublishOutgoing(input: Outgoing): Promise<void> {
    return this.outgoingChannel.Publish(input)
  }

  public SubscribeIncoming(listener: SubscribeListener<Incoming>): void {
    return this.incomingChannel.Subscribe(listener)
  }

  public SubscribeOutgoing(listener: SubscribeListener<Outgoing>): void {
    return this.outgoingChannel.Subscribe(listener)
  }

  public CreateIncomingSubscriptionConfig(host: string) {
    return this.incomingChannel.CreateSubscriptionConfig(host)
  }

  public CreateOutgoingSubscriptionConfig(host: string) {
    return this.outgoingChannel.CreateSubscriptionConfig(host)
  }

  get NotificationRouter(): Router {
    let router = Router()
    router.use(this.incomingChannel.NotificationRouter)
    router.use(this.outgoingChannel.NotificationRouter)
    return router
  }

  public async PrepareTopic() {
    await this.incomingChannel.PrepareTopic()
    await this.outgoingChannel.PrepareTopic()
  }

  public async Purge() {
    this.UnsubscribeAll()

    await this.incomingChannel.Purge()
    await this.outgoingChannel.Purge()
  }

  public async UnsubscribeAll() {
    this.incomingChannel.UnsubscribeAll()
    this.outgoingChannel.UnsubscribeAll()
  }

  public async UnsubscribeAllIncomingMessage() {
    this.incomingChannel.UnsubscribeAll()
  }

  public async UnsubscribeAllOutgoingMessage() {
    this.outgoingChannel.UnsubscribeAll()
  }
}
