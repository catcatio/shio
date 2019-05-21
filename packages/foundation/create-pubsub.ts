import { PubSub } from '@google-cloud/pubsub'

export function CreateCloudPubSubInstance(apiEndpoint?: string) {
  return new PubSub({
    apiEndpoint,
    projectId: 'catcat-development'
  })
}
