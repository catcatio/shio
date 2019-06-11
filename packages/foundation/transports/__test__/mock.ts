import { PublishIncomingMessageInput, PublishOutgoingMessageInput, MessageChannelTransport, SubscribeListener, PaymentChannelTransport } from '../pubsub'
import { ReservePaymentMessage, ConfirmPaymentMessage } from '../../entities'

export class __mock__CloudPubsubMessageTransports implements MessageChannelTransport {
  incomingSubs: SubscribeListener<PublishIncomingMessageInput>[] = []
  outgoingSubs: SubscribeListener<PublishOutgoingMessageInput>[] = []

  ack = jest.fn()

  async PublishIncoming(input: PublishIncomingMessageInput): Promise<void> {
    await Promise.all(
      this.incomingSubs.map(async i => {
        await i(input, this.ack)
      })
    )
  }
  SubscribeIncoming(listener: SubscribeListener<PublishIncomingMessageInput>): void {
    this.incomingSubs.push(listener)
  }
  PublishOutgoing(input: PublishOutgoingMessageInput): Promise<void> {
    throw new Error('Method not implemented.')
  }
  SubscribeOutgoing(listener: SubscribeListener<PublishOutgoingMessageInput>): void {
    throw new Error('Method not implemented.')
  }
  UnsubscribeAll(): void {
    throw new Error('Method not implemented.')
  }
}

export class __mock__CloudPubsubPaymentTransports implements PaymentChannelTransport {
  incomingSubs: SubscribeListener<ReservePaymentMessage>[] = []
  outgoingSubs: SubscribeListener<ConfirmPaymentMessage>[] = []

  ack = jest.fn()

  async PublishIncoming(input: ReservePaymentMessage): Promise<void> {
    await Promise.all(
      this.incomingSubs.map(async i => {
        await i(input, this.ack)
      })
    )
  }
  SubscribeIncoming(listener: SubscribeListener<ReservePaymentMessage>): void {
    this.incomingSubs.push(listener)
  }
  async PublishOutgoing(input: ConfirmPaymentMessage): Promise<void> {
    await Promise.all(
      this.outgoingSubs.map(async i => {
        await i(input, this.ack)
      })
    )
  }
  SubscribeOutgoing(listener: SubscribeListener<ConfirmPaymentMessage>): void {
    this.outgoingSubs.push(listener)
  }
  UnsubscribeAll(): void {
    throw new Error('Method not implemented.')
  }

  PublishReservePayment(input: ReservePaymentMessage): Promise<void> {
    return this.PublishIncoming(input)
  }

  SubscribeReservePayment(listener: SubscribeListener<ReservePaymentMessage>): void {
    return this.SubscribeIncoming(listener)
  }

  PublishConfirmPayment(input: ConfirmPaymentMessage): Promise<void> {
    return this.PublishOutgoing(input)
  }

  SubscribeConfirmPayment(listener: SubscribeListener<ConfirmPaymentMessage>): void {
    return this.SubscribeOutgoing(listener)
  }
}
