import { MessageChannelTransport, MessageChannelManager, PublishIncomingMessageInput, PublishOutgoingMessageInput } from '@shio-bot/foundation'

import { Router } from 'express'
import { SubscribeListener } from '@shio-bot/foundation/transports/pubsub'
import { IncomingMessage, OutgoingMessage } from 'http'

export interface MessageChannelTransportExt extends MessageChannelTransport, MessageChannelManager {}

export class EchoPubSubTransport implements MessageChannelTransportExt {
  private incomingMessageListener: SubscribeListener<PublishIncomingMessageInput>[] = []
  private outcomingMessageListener: SubscribeListener<PublishOutgoingMessageInput>[] = []

  constructor() {
    this.SubscribeIncoming(
      ((input: PublishIncomingMessageInput, ack: () => void) => {
        this.onIncomingMessage(input, ack)
      }).bind(this)
    )
  }

  private onIncomingMessage(input: PublishIncomingMessageInput, ack: () => void) {
    let fulfillment: any = {
      name: input.intent.name,
      parameters: {
        isCompleted: true
      }
    }

    this.PublishOutgoing({
      fulfillment: [fulfillment],
      provider: input.provider,
      replyToken: input.replyToken,
      languageCode: input.languageCode,
      source: input.source,
      requestId: input.requestId
    })
    ack()
  }

  async PublishIncoming(input: PublishIncomingMessageInput): Promise<void> {
    this.incomingMessageListener.forEach(listener => listener.bind(this)(input, () => {}))
  }
  SubscribeIncoming(listener: SubscribeListener<PublishIncomingMessageInput>): void {
    this.incomingMessageListener.push(listener)
  }
  UnsubscribeAllIncomingMessage(): void {
    this.incomingMessageListener = []
  }
  async PublishOutgoing(input: PublishOutgoingMessageInput): Promise<void> {
    this.outcomingMessageListener.forEach(listener => listener(input, () => {}))
  }
  SubscribeOutgoing(listener: SubscribeListener<PublishOutgoingMessageInput>): void {
    this.outcomingMessageListener.push(listener)
  }
  UnsubscribeAll(): void {
    this.outcomingMessageListener = []
    this.incomingMessageListener = []
  }

  get NotificationRouter(): Router {
    return Router()
  }

  async CreateIncomingSubscriptionConfig(host: string): Promise<void> {
    // do nothing
  }
  async CreateOutgoingSubscriptionConfig(host: string): Promise<void> {
    // do nothing
  }
  async PrepareTopic(): Promise<void> {
    // do nothing
  }
  async Purge(): Promise<void> {
    // do nothing
  }
}
