import { MessageChannelTransport, CloudPubsubMessageChannelTransport } from './pubsub';
import { PubsubOption, createCloudPubSubInstance } from '../pubsub';

export * from './pubsub'


export async function createCloudPubsubMessageChannel(serviceName: string, ...pubsubOptions: PubsubOption[]): Promise<MessageChannelTransport> {
  const cloudpubsub = await createCloudPubSubInstance(...pubsubOptions)
  const cloudpubsubMessageChannel = new CloudPubsubMessageChannelTransport({
    pubsub: cloudpubsub,
    serviceName,
  })
  return cloudpubsubMessageChannel
}