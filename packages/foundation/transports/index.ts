import { CloudPubsubMessageChannelTransport, PublishIncomingMessageInput } from './pubsub/message'
import { PubsubOption, createCloudPubSubInstance } from '../pubsub'
import { CloudPubsubDuoChannelTransport, PublishOutgoingMessageInput } from './pubsub'

export * from './pubsub/message'

export async function createCloudPubsubMessageChannel(
  serviceName: string,
  ...pubsubOptions: PubsubOption[]
): Promise<CloudPubsubDuoChannelTransport<PublishIncomingMessageInput, PublishOutgoingMessageInput>> {
  const cloudpubsub = await createCloudPubSubInstance(...pubsubOptions)
  const cloudpubsubMessageChannel = new CloudPubsubMessageChannelTransport({
    pubsub: cloudpubsub,
    serviceName
  })
  return cloudpubsubMessageChannel
}
