import {
  MessageChannelTransport,
  MessageChannelManager,
  SubscribeIncomingMessageListener,
  SubscribeOutgoingMessageListener,
  PublishIncommingMessageInput,
  PublishOutgoingMessageInput
} from '@shio-bot/foundation'

import { Router } from 'express'

export interface MessageChannelTransportExt extends MessageChannelTransport, MessageChannelManager {}

export class EchoPubSubTransport implements MessageChannelTransportExt {
  private incomingMessageListener: SubscribeIncomingMessageListener[] = []
  private outcomingMessageListener: SubscribeOutgoingMessageListener[] = []

  constructor() {
    this.SubscribeIncommingMessage(
      ((input: PublishIncommingMessageInput, ack: () => void) => {
        this.onIncomingMessage(input, ack)
      }).bind(this)
    )
  }

  private onIncomingMessage(input: PublishIncommingMessageInput, ack: () => void) {
    let fulfillment: any = {
      name: input.intent.name,
      parameters: {
        isCompleted: true
      }
    }

    this.PublishOutgoingMessage({
      fulfillment: [fulfillment],
      provider: input.provider,
      replyToken: input.replyToken,
      languageCode: input.languageCode,
      source: input.source,
      requestId: input.requestId
    })
    ack()
  }

  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    this.incomingMessageListener.forEach(listener => listener.bind(this)(input, () => {}))
  }
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.incomingMessageListener.push(listener)
  }
  UnsubscribeAllIncomingMessage(): void {
    this.incomingMessageListener = []
  }
  async PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void> {
    this.outcomingMessageListener.forEach(listener => listener(input, () => {}))
  }
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void {
    this.outcomingMessageListener.push(listener)
  }
  UnsubscribeAllOutgoingMessage(): void {
    this.outcomingMessageListener = []
  }

  get messageRouter(): Router {
    return Router()
  }

  async createIncomingSubscriptionConfig(host: string): Promise<void> {
    // do nothing
  }
  async createOutgoingSubscriptionConfig(host: string): Promise<void> {
    // do nothing
  }
  async prepareTopic(): Promise<void> {
    // do nothing
  }
  async purge(): Promise<void> {
    // do nothing
  }
}
