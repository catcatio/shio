import {
  createCloudPubSubInstance,
  WithPubsubProjectId,
  WithPubsubEndpoint,
  CloudPubsubMessageChannelTransport,
  GetEnvString,
  newLogger,
  MessageChannelTransport,
  UnPromise,
  GetEnvConfig,
  getLocalhostUrl
} from '@shio-bot/foundation'
import { OutgoingMessage, IncomingMessage, ReservePaymentMessage } from '@shio-bot/foundation/entities'
import { MessageFulfillment } from '@shio-bot/foundation/entities/intent'
import { NarrowUnion } from '../app/endpoints/default'
import * as express from 'express'
import { Server } from 'http'
import { FixtureStep, FixtureContext } from './fixture'
import { CloudPubsubPaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub';

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
  const config = GetEnvConfig()
  const ps = await createCloudPubSubInstance(WithPubsubProjectId(config.projectId), WithPubsubEndpoint(config.pubsubEndpoint))
  const log = newLogger().withUserId('integration-test')

  const messageInOut = new CloudPubsubMessageChannelTransport({
    pubsub: ps,
    serviceName: 'integration-test-follow-intent'
  })

  const paymentInOut = new CloudPubsubPaymentChannelTransport({
    pubsub: ps,
    serviceName: 'integration-test-follow-intent'
  })

  await paymentInOut.PrepareTopic()
  await messageInOut.PrepareTopic()

  let resolve: any
  let server: Server

  return {
    pubsub: messageInOut,
    async start() {
      const app = express()
      app.use(express.json())
      app.use('/', messageInOut.NotificationRouter)
      app.use('/', paymentInOut.NotificationRouter)
      app.get('/', (req, res) => res.status(200).send('ok'))
      server = app.listen(8091, () => {
        log.info('test server started 8091')
      })
      await messageInOut.CreateOutgoingSubscriptionConfig(getLocalhostUrl() + ":8091")
      await paymentInOut.CreateOutgoingSubscriptionConfig(getLocalhostUrl() + ":8091")

    },
    sendIncomingMessage: (m: IncomingMessage): Promise<OutgoingMessage | ReservePaymentMessage> => {
      if (GetEnvString('FULFILLMENT_INTEGRATION_DEBUG') === '1') {
        jest.setTimeout(1000 * 60 * 60)
      }
      return new Promise<OutgoingMessage | ReservePaymentMessage>(async (res, reject) => {
        resolve = res
        paymentInOut.SubscribeOutgoing((msg, ack) => {
          ack()
          res(msg)
        })
        messageInOut.SubscribeOutgoing((message, ack) => {
          if (message.requestId !== m.requestId) {
            log.info(`IGNORE MESSAGE WITH REQUEST ID ${message.requestId}`)
            reject('INVALID MESSAGE ID')
          } else {
            log.info('OUTGOING RESPONSE!')
            resolve(message)
          }
          ack()
        })

        log.info(`send message... (${m.intent.name})`)
        messageInOut.PublishIncoming(m)
      })
    },
    clean: async () => {
      await new Promise(r => {
        server.close(() => {
          log.info('server is shutdown')
          r()
        })
      })
      messageInOut.UnsubscribeAllIncomingMessage()
      messageInOut.UnsubscribeAllOutgoingMessage()
    }
  }
}
