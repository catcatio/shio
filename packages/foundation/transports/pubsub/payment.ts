import { CloudPubsubChannelOptions, SubscribeListener } from './cloud-pubsub-transport'
import { CloudPubsubDuoChannel, CloudPubsubDuoChannelTransport, CloudPubsubDuoChannelManager } from './duo-cloud-pubsub-transport'
import { ReservePaymentMessage, ConfirmPaymentMessage } from '../../entities'

export interface PaymentChannelTransport extends CloudPubsubDuoChannelTransport<ConfirmPaymentMessage, ReservePaymentMessage> {
  PublishReservePayment(input: ReservePaymentMessage): Promise<void>
  SubscribeReservePayment(listener: SubscribeListener<ReservePaymentMessage>): void

  PublishConfirmPayment(input: ConfirmPaymentMessage): Promise<void>
  SubscribeConfirmPayment(listener: SubscribeListener<ConfirmPaymentMessage>): void
}

export interface PaymentChannelManager extends CloudPubsubDuoChannelManager {}

export class CloudPubsubPaymentChannelTransport extends CloudPubsubDuoChannel<ConfirmPaymentMessage, ReservePaymentMessage>
  implements PaymentChannelTransport, PaymentChannelManager {
  constructor(options: CloudPubsubChannelOptions) {
    super(
      options,
      {
        topicName: 'shio-confirm-payment-topic',
        subscriptionName: 'shio-confirm-payment-subscription',
        notificationPath: '/confirmpayment'
      },
      {
        topicName: 'shio-reserve-payment-topic',
        subscriptionName: 'shio-reserve-payment-subscription',
        notificationPath: '/reservepayment'
      }
    )
  }

  PublishReservePayment(input: ReservePaymentMessage): Promise<void> {
    return this.PublishOutgoing(input)
  }

  SubscribeReservePayment(listener: SubscribeListener<ReservePaymentMessage>): void {
    return this.SubscribeOutgoing(listener)
  }

  PublishConfirmPayment(input: ConfirmPaymentMessage): Promise<void> {
    return this.PublishIncoming(input)
  }

  SubscribeConfirmPayment(listener: SubscribeListener<ConfirmPaymentMessage>): void {
    return this.SubscribeIncoming(listener)
  }
}
