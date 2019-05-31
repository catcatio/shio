import config from './config'
import { createCloudPubSubInstance, WithPubsubProjectId, WithPubsubEndpoint, CloudPubsubMessageChannelTransport, GetEnvString, newLogger } from '@shio-bot/foundation'
import { OutgoingMessage, IncomingMessage } from '@shio-bot/foundation/entities'
import { MessageFulfillment } from '@shio-bot/foundation/entities/intent'
import { NarrowUnion } from '../app/endpoints/default'

export function expectFulfillment<Intent extends MessageFulfillment['name']>(name: Intent, assertFunction: (fulfillment: NarrowUnion<MessageFulfillment, Intent>) => void) {
  return function(message: OutgoingMessage) {
    expect(message.fulfillment[0].name).toEqual(name)
    assertFunction(message.fulfillment[0] as any)
  }
}

export const createPubsubIntegrationClient = async () => {
  const ps = await createCloudPubSubInstance(WithPubsubProjectId(config.projectId), WithPubsubEndpoint(config.pubsubEndpoint))
  const log = newLogger().withUserId('integration-test')
  let host: string = config.host

  const pubsub = new CloudPubsubMessageChannelTransport({
    pubsub: ps,
    host,
    serviceName: 'integration-test-follow-intent'
  })

  let resolve: any
  return {
    pubsub,
    async start() {
      pubsub.start(8091)
      await pubsub.setOutgoingSubscriptionConfig('http://host.docker.internal:8091')
    },
    sendIncomingMessage: (m: IncomingMessage): Promise<OutgoingMessage> => {
      if (GetEnvString('FULFILLMENT_INTEGRATION_DEBUG') === '1') {
        jest.setTimeout(1000 * 60 * 60)
      }
      return new Promise<OutgoingMessage>(async (res, reject) => {
        resolve = res
        pubsub.SubscribeOutgoingMessage((message, ack) => {
          if (message.requestId !== m.requestId) {
            log.info(`IGNORE MESSAGE WITH REQUEST ID ${message.requestId}`)
            reject('INVALID MESSAGE ID')
          } else {
            log.info('OUTGOING RESPONSE!')
            resolve(message)
          }
          ack()
        })

        pubsub.PublishIncommingMessage(m)
      })
    },
    clean: async () => {
      await pubsub.stop()
      pubsub.UnsubscribeAllIncomingMessage()
      pubsub.UnsubscribeAllOutgoingMessage()
    }
  }
}
