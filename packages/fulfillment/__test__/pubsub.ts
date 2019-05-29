import config from './config'
import { createCloudPubSubInstance, WithPubsubProjectId, WithPubsubEndpoint, CloudPubsubTransports, GetEnvString } from '@shio/foundation'
import { OutgoingMessage, IncomingMessage } from '@shio/foundation/entities'
import { MessageFulfillment } from '@shio/foundation/entities/intent'
import { NarrowUnion } from '../app/endpoints/default'

export function expectFulfillment<Intent extends MessageFulfillment['name']>(name: Intent, assertFunction: (fulfillment: NarrowUnion<MessageFulfillment, Intent>) => void) {
  return function(message: OutgoingMessage) {
    expect(message.fulfillment[0].name).toEqual(name)
    assertFunction(message.fulfillment[0] as any)
  }
}

export const createPubsubIntegrationClient = () => {
  const ps = createCloudPubSubInstance(WithPubsubProjectId(config.projectId), WithPubsubEndpoint(config.pubsubEndpoint))
  const pubsub = new CloudPubsubTransports(ps, 'integration-test-follow-intent')

  return {
    pubsub,
    sendIncomingMessage: (m: IncomingMessage): Promise<OutgoingMessage> => {
      if (GetEnvString('FULFILLMENT_INTEGRATION_DEBUG') === '1') {
        jest.setTimeout(1000 * 60 * 60)
      }
      return new Promise<OutgoingMessage>(async (resolve, reject) => {
        const t = setTimeout(reject, 2000)
        clearInterval(t)
        pubsub.SubscribeOutgoingMessage((message, ack) => {
          ack()
          if (message.requestId !== m.requestId) {
            console.warn(`IGNORE MESSAGE WITH REQUEST ID ${message.requestId}`)
          } else {
            resolve(message)
          }
        })
        pubsub.PublishIncommingMessage(m)
      })
    },
    clean: () => {
      pubsub.UnsubscribeAllIncomingMessage()
      pubsub.UnsubscribeAllOutgoingMessage()
    }
  }
}
