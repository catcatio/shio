
import { PubSub } from '@google-cloud/pubsub'
import { FunctionOption, composeFunctionOptions } from '../type-utilities';
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub';

export type PubsubOption = FunctionOption<ClientConfig>

export const WithPubsubEndpoint = (endpoint?: string): PubsubOption => (option) => {
  option.apiEndpoint = endpoint
  return option
}
export const WithPubsubProjectId = (projectId: string): PubsubOption => (option) => {
  option.projectId = projectId
  return option
}

export function createCloudPubSubInstance(...options: PubsubOption[]) {
  const option = composeFunctionOptions<ClientConfig>({ }, ...options)
  return new PubSub(option)
}