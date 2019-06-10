import { CloudPubsubChannelOptions } from './cloud-pubsub-transport'
import { CloudPubsubDuoChannel, CloudPubsubDuoChannelTransport, CloudPubsubDuoChannelManager } from './duo-cloud-pubsub-transport'
import { IncomingMessage, OutgoingMessage } from '../../entities/message'

export interface PublishIncomingMessageInput extends IncomingMessage {}

export interface PublishOutgoingMessageInput extends OutgoingMessage {}

export interface MessageChannelTransport extends CloudPubsubDuoChannelTransport<PublishIncomingMessageInput, PublishOutgoingMessageInput> {}

export interface MessageChannelManager extends CloudPubsubDuoChannelManager {}

export class CloudPubsubMessageChannelTransport extends CloudPubsubDuoChannel<PublishIncomingMessageInput, PublishOutgoingMessageInput>
  implements MessageChannelTransport, MessageChannelManager {
  constructor(options: CloudPubsubChannelOptions) {
    super(
      options,
      {
        topicName: 'shio-incoming-message',
        subscriptionName: 'shio-fullfillment-service',
        notificationPath: '/incoming'
      },
      {
        topicName: 'shio-outgoing-message',
        subscriptionName: 'shio-outgoing-subscription',
        notificationPath: '/outgoing'
      }
    )
  }
}
