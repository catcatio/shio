import { IncomingMessage, OutgoingMessage } from '../entities'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'
import * as express from 'express'
import { json } from 'body-parser'
import { newLogger, ShioLogger } from '../logger'
import { Server } from 'http'

export const PUBSUB_INCOMING_MESSAGE_TOPIC = 'shio-incoming-message'
export const PUBSUB_FULLFILLMENT_SUBSCRIPTION = 'shio-fullfillment-service'

export const PUBSUB_OUTGOING_MESSAGE_TOPIC = 'shio-outgoing-message'
export const PUBSUB_OUTGOING_SUBSCRIPTION = 'shio-outgoing-subscription'

export interface PublishIncommingMessageInput extends IncomingMessage {}
export type SubscribeIncomingMessageListener = (message: IncomingMessage, acknowledge: () => void) => Promise<void> | void

export interface PublishOutgoingMessageInput extends OutgoingMessage {}
export type SubscribeOutgoingMessageListener = (message: OutgoingMessage, acknowledge: () => void) => Promise<void> | void

export interface MessageChannelTransport {
  PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void>
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void
  UnsubscribeAllIncomingMessage(): void

  PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void>
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void
  UnsubscribeAllOutgoingMessage(): void
}

export type CloudPubsubMessageChannelOptions = {
  pubsub: PubSub
  serviceName: string
}
export class CloudPubsubMessageChannelTransport implements MessageChannelTransport {
  private pubsub: PubSub

  app: express.Express
  private log: ShioLogger = newLogger()
  private serviceName: string
  private port: number

  constructor({ pubsub, serviceName }: CloudPubsubMessageChannelOptions) {
    this.pubsub = pubsub
    this.serviceName = serviceName

    this.incomingTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.outgoingTopic = this.pubsub.topic(PUBSUB_OUTGOING_MESSAGE_TOPIC)
    this.incomingSubscription = this.incomingTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    this.outgoingSubscription = this.outgoingTopic.subscription(PUBSUB_OUTGOING_SUBSCRIPTION)

    this.app = express()
    this.app.use(json({}))
    this.app.get('/', (req, res) => {
      res.status(200).end('ok')
    })
    this.log.info('Create http server for push message...')

    this.app.post('/outgoing', (req, res) => {
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8')
      const f = this.outgoingListenerFunction(JSON.parse(message), () => {
        res.status(200).send()
      })
      if (f && typeof f.then === 'function') {
        f.then()
      }
    })

  }

  server: Server
  start(port: number = 8080) {
    this.port = port
    this.log.info(`Start pubsub server :${this.port}`)
    this.server = this.app.listen(port)
  }
  stop() {
    return new Promise((resolve, reject) => {
      this.log.info(`shutdown pubsub server :${this.port}....`)
      this.server.close((err) => {
        this.log.info("server is shutdown")
        resolve()
      })
    })
  }

  public incomingTopic: Topic
  public incomingSubscription: Subscription
  private outgoingTopic: Topic
  private outgoingSubscription: Subscription

  async setIncomingSubscriptionConfig(incomingPushEndpointHost: string) {
    this.log.info(`Update incoming subscription config endpoint ${incomingPushEndpointHost}`)
    const isIncomingExists = await this.incomingSubscription.exists()
    if (!isIncomingExists[0]) {
      await this.incomingTopic.createSubscription(this.incomingSubscription.name, {
        pushConfig: {
          pushEndpoint: incomingPushEndpointHost + '/incoming'
        }
      })
    }
  }

  async setOutgoingSubscriptionConfig(outgoingPushEndpointHost: string) {
    this.log.info(`Update outgoing subscription config endpoint ${outgoingPushEndpointHost}`)
    const isOutgoingExists = await this.outgoingSubscription.exists()
    if (!isOutgoingExists[0]) {
      await this.outgoingTopic.createSubscription(this.outgoingSubscription.name, {
        pushConfig: {
          pushEndpoint: outgoingPushEndpointHost + '/outgoing'
        }
      })
    }
  }

  async prepareTopic() {
    this.log.info('Prepare subscription channel message...')
    const [topics] = await this.pubsub.getTopics()
    this.log.info('Topic list')
    this.log.info(topics.map(t => t.name).join('\n'))
    await Promise.all([this.incomingTopic.get({ autoCreate: true }), this.outgoingTopic.get({ autoCreate: true })])
  }

  // purge method will remove subscription channel of
  // incoming and outgoing message and create new one
  // please aware that you need to re subscribe the subscription
  // channel again after purge
  async purge() {
    this.log.info('Purge subscription channel message...')
    this.UnsubscribeAllIncomingMessage()
    this.UnsubscribeAllOutgoingMessage()

    if ((await this.incomingTopic.exists())[0] && (await this.incomingSubscription.exists())[0]) {
      await this.incomingSubscription.delete()
    }

    if ((await this.outgoingTopic.exists())[0] && (await this.outgoingSubscription.exists())[0]) {
      await this.outgoingSubscription.delete()
    }
  }

  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    await this.incomingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.log.info('Handle incoming message register at POST /incoming')
    this.app.post('/incoming', (req, res) => {
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8')
      const f = listener(JSON.parse(message), () => {
        res.status(200).send()
      })
      if (f && typeof f.then === 'function') {
        f.then()
      }
    })
  }

  UnsubscribeAllIncomingMessage(): void {
    this.incomingSubscription.removeAllListeners('message')
  }

  async PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void> {
    this.log.info(`Publish message to outgoing topic: ${input.provider}(${input.source.userId})`)
    await this.outgoingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  UnsubscribeAllOutgoingMessage(): void {
    this.outgoingSubscription.removeAllListeners('message')
  }

  private outgoingListenerFunction: SubscribeOutgoingMessageListener
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void {

    this.log.info('Handle outgoing message register at POST /outgoing')
    this.outgoingListenerFunction = listener


  }
}
