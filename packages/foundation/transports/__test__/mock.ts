import { CloudPubsubTransport, PubsubTransport, SubscribeIncomingMessageListener, SubscribeOutgoingMessageListener } from '../pubsub'

export class __mock__CloudPubsubTransports implements PubsubTransport {
  incomingSubs: SubscribeIncomingMessageListener[] = []
  outgoingSubs: SubscribeOutgoingMessageListener[] = []

  ack = jest.fn()

  async PublishIncommingMessage(input: import('../pubsub').PublishIncommingMessageInput): Promise<void> {
    await Promise.all(
      this.incomingSubs.map(async i => {
        await i(input, this.ack)
      })
    )
  }
  SubscribeIncommingMessage(listener: import('../pubsub').SubscribeIncomingMessageListener): void {
    this.incomingSubs.push(listener)
  }
  UnsubscribeAllIncomingMessage(): void {
    throw new Error('Method not implemented.')
  }
  PublishOutgoingMessage(input: import('../pubsub').PublishOutgoingMessageInput): Promise<void> {
    throw new Error('Method not implemented.')
  }
  SubscribeOutgoingMessage(listener: import('../pubsub').SubscribeOutgoingMessageListener): void {
    throw new Error('Method not implemented.')
  }
  UnsubscribeAllOutgoingMessage(): void {
    throw new Error('Method not implemented.')
  }
}
