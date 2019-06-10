import { PublishIncomingMessageInput, PublishOutgoingMessageInput, MessageChannelTransport, SubscribeListener, PaymentChannelTransport } from '../pubsub'
import { ReservePayment, ConfirmPayment } from '../../entities'

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
  incomingSubs: SubscribeListener<ReservePayment>[] = []
  outgoingSubs: SubscribeListener<ConfirmPayment>[] = []

  ack = jest.fn()

  async PublishIncoming(input: ReservePayment): Promise<void> {
    await Promise.all(
      this.incomingSubs.map(async i => {
        await i(input, this.ack)
      })
    )
  }
  SubscribeIncoming(listener: SubscribeListener<ReservePayment>): void {
    this.incomingSubs.push(listener)
  }
  PublishOutgoing(input: ConfirmPayment): Promise<void> {
    throw new Error('Method not implemented.')
  }
  SubscribeOutgoing(listener: SubscribeListener<ConfirmPayment>): void {
    throw new Error('Method not implemented.')
  }
  UnsubscribeAll(): void {
    throw new Error('Method not implemented.')
  }
}
