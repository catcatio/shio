import { IncomingMessage, OutgoingMessage } from '../entities'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'
import * as express from 'express'
import { newLogger, ShioLogger } from '../logger'

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

  PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void>
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void

  UnsubscribeAllIncomingMessage(): void
  UnsubscribeAllOutgoingMessage(): void
}
export interface MessageChannelManager {
  createIncomingSubscriptionConfig(host: string): Promise<void>
  createOutgoingSubscriptionConfig(host: string): Promise<void>
  prepareTopic(): Promise<void>
  purge(): Promise<void>

  messageRouter: express.Router
}

export type CloudPubsubMessageChannelOptions = {
  pubsub: PubSub
  serviceName: string
}
export class CloudPubsubMessageChannelTransport implements MessageChannelTransport, MessageChannelManager {
  public incomingTopic: Topic
  public incomingSubscription: Subscription
  public outgoingTopic: Topic
  public outgoingSubscription: Subscription

  private pubsub: PubSub
  private log: ShioLogger = newLogger()
  private serviceName: string

  constructor({ pubsub, serviceName }: CloudPubsubMessageChannelOptions) {
    this.pubsub = pubsub
    this.serviceName = serviceName

    this.incomingTopic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.outgoingTopic = this.pubsub.topic(PUBSUB_OUTGOING_MESSAGE_TOPIC)
    this.incomingSubscription = this.incomingTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    this.outgoingSubscription = this.outgoingTopic.subscription(PUBSUB_OUTGOING_SUBSCRIPTION)
  }

  private incomingListenerFunction: SubscribeIncomingMessageListener
  private outgoingListenerFunction: SubscribeOutgoingMessageListener
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.log.info('Handle incoming message register at POST /incoming')
    this.incomingListenerFunction = listener
  }
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void {
    this.log.info('Handle outgoing message register at POST /outgoing')
    this.outgoingListenerFunction = listener
  }
  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    await this.incomingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  async PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void> {
    this.log.info(`Publish message to outgoing topic: ${input.provider}(${input.source.userId})`)
    await this.outgoingTopic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  // @deprecated: no longer need to remove listeners, only use on delivery type pull only
  // currently we use push type to subscript message from pubsub
  UnsubscribeAllIncomingMessage(): void {
    this.incomingSubscription.removeAllListeners('message')
  }

  // @deprecated: no longer need to remove listeners, only use on delivery type pull only
  // currently we use push type to subscript message from pubsub
  UnsubscribeAllOutgoingMessage(): void {
    this.outgoingSubscription.removeAllListeners('message')
  }

  // Express instance management method
  // if you want to extends server
  // please define new function here
  get messageRouter(): express.Router {
    let router = express.Router()

    router.get('/outgoing', (req, res) => {
      res.status(200).end('ok')
    })

    router.post('/outgoing', (req, res) => {
      if (!this.outgoingListenerFunction) {
        res.status(403).end('Outgoing listener does not registered')
        return
      }
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8')
      try {
        const f = this.outgoingListenerFunction(JSON.parse(message), () => {
          res.status(200).send()
        })
        if (f && typeof f.then === 'function') {
          f.then()
        }
      } catch (e) {
        // HANDLE INVALID PAYLOAD
        this.log
          .withFields({
            body: JSON.stringify(req.body),
            payloadMessage: message,
            error: e
          })
          .error('outgoing message handle error')
        res.status(200).end()
      }
    })

    router.get('/incoming', (req, res) => {
      res.status(200).end('ok')
    })

    router.post('/incoming', (req, res) => {
      if (!this.incomingListenerFunction) {
        res.status(403).end('Incoming listener does not registered')
        return
      }

      const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8')
      try {
        const f = this.incomingListenerFunction(JSON.parse(message), () => {
          res.status(200).send()
        })
        if (f && typeof f.then === 'function') {
          f.then()
        }
      } catch (e) {
        // HANDLE INVALID PAYLOAD
        this.log
          .withFields({
            body: req.body,
            payloadMessage: message,
            error: e
          })
          .error('incomming message handle error')
        res.status(200).end()
      }
    })

    return router
  }

  // Cloud pubsub topic management utility function
  // to prepare pubsub for service
  // use this utility function before service start
  // these functions must use outside service instance
  // eg. on migration script, cron, or deployment manager

  async createIncomingSubscriptionConfig(incomingPushEndpointHost: string) {
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

  async createOutgoingSubscriptionConfig(outgoingPushEndpointHost: string) {
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
}
