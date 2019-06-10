import { CloudPubsubChannelOptions } from './cloud-pubsub-transport'
import { CloudPubsubDuoChannel, CloudPubsubDuoChannelTransport, CloudPubsubDuoChannelManager } from './duo-cloud-pubsub-transport'
import { ReservePayment, ConfirmPayment } from '../../entities'

export interface PaymentChannelTransport extends CloudPubsubDuoChannelTransport<ReservePayment, ConfirmPayment> {}

export interface PaymentChannelManager extends CloudPubsubDuoChannelManager {}

export class CloudPubsubPaymentChannelTransport extends CloudPubsubDuoChannel<ReservePayment, ConfirmPayment> implements PaymentChannelTransport, PaymentChannelManager {
  constructor(options: CloudPubsubChannelOptions) {
    super(
      options,
      {
        topicName: 'shio-reserve-payment-topic',
        subscriptionName: 'shio-reserve-payment-subscription',
        notificationPath: '/reservepayment'
      },
      {
        topicName: 'shio-confirm-payment-topic',
        subscriptionName: 'shio-confirm-payment-subscription',
        notificationPath: '/confirmpayment'
      }
    )
  }
}
