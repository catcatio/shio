import config from './config'
import { createCloudPubSubInstance, WithPubsubProjectId, WithPubsubEndpoint, CloudPubsubMessageChannelTransport, GetEnvString, newLogger, MessageChannelTransport, UnPromise } from '@shio-bot/foundation'
import { OutgoingMessage, IncomingMessage } from '@shio-bot/foundation/entities'
import { MessageFulfillment } from '@shio-bot/foundation/entities/intent'
import { NarrowUnion } from '../app/endpoints/default'
import * as express from 'express'
import { Server } from 'http'
import { FixtureStep, FixtureContext } from './fixture';

export function runFixtureSteps(ctx: FixtureContext, pubsub: UnPromise<ReturnType<typeof createPubsubIntegrationClient>>) {
  return async (...steps: FixtureStep[]) => {
    for (const step of steps) {
      const { expect, incomingMessage } = step(ctx)
      const outgoingMessage = await pubsub.sendIncomingMessage(incomingMessage)
      expect(outgoingMessage, ctx)
    }
  }
}


export function expectFulfillment(message: OutgoingMessage) {
  return <Intent extends MessageFulfillment['name']>(name: Intent, assertFunction: (fulfillment: NarrowUnion<MessageFulfillment, Intent>) => void) => {
    expect(message.fulfillment[0].name).toEqual(name)
    assertFunction(message.fulfillment[0] as any)
  }
}

export const createPubsubIntegrationClient = async () => {
  const ps = await createCloudPubSubInstance(WithPubsubProjectId(config.projectId), WithPubsubEndpoint(config.pubsubEndpoint))
  const log = newLogger().withUserId('integration-test')

  const pubsub = new CloudPubsubMessageChannelTransport({
    pubsub: ps,
    serviceName: 'integration-test-follow-intent'
  })

  let resolve: any
  let server: Server
  return {
    pubsub,
    async start() {
      const app = express()
      app.use(express.json())
      app.use('/', pubsub.messageRouter)
      app.get('/', (req, res) => res.status(200).send('ok'))
      server = app.listen(8091, () => {
        console.log('test server started ', 8091)
      })
      await pubsub.createOutgoingSubscriptionConfig('http://host.docker.internal:8091')
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
      await new Promise(resolve => {
        server.close(() => {
          log.info('server is shutdown')
          resolve()
        })
      })
      pubsub.UnsubscribeAllIncomingMessage()
      pubsub.UnsubscribeAllOutgoingMessage()
    }
  }
}
