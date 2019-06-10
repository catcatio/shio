import { Router } from 'express'
import { PubSub, Topic, Subscription } from '@google-cloud/pubsub'
import { newLogger, ShioLogger } from '../../logger'
const nanoid = require('nanoid')

export type SubscribeListener<T> = (message: T, acknowledge: () => void) => Promise<void> | void

export interface ChannelTransport<T> {
  Publish(input: T): Promise<void>
  Subscribe(listener: SubscribeListener<T>): void

  UnsubscribeAll(): void
}

export interface ChannelManager<T> {
  CreateSubscriptionConfig(host: string): Promise<void>
  PrepareTopic(): Promise<void>
  Purge(): Promise<void>

  // DebugIncomingMessage(listener: (message: any) => void)

  NotificationRouter: Router
}

export class CloudPubsubTransport<T> implements ChannelTransport<T>, ChannelManager<T> {
  public topic: Topic
  public subscription: Subscription

  private pubsub: PubSub
  private log: ShioLogger = newLogger()
  private serviceName: string
  private topicName: string
  private subscriptionName: string
  private notificationPath: string

  constructor({ pubsub, serviceName }: CloudPubsubChannelOptions, { topicName, subscriptionName, notificationPath }: TopicOptions) {
    this.pubsub = pubsub
    this.serviceName = serviceName
    this.topicName = topicName
    this.subscriptionName = subscriptionName
    this.notificationPath = notificationPath

    this.subscribeChannels()
  }

  protected subscribeChannels() {
    this.topic = this.pubsub.topic(this.topicName)
    this.subscription = this.topic.subscription(this.subscriptionName)
  }

  private listenerFunction: SubscribeListener<T>
  Subscribe(listener: SubscribeListener<T>): void {
    this.log.info('Handle incoming message register at POST ' + this.notificationPath)
    this.listenerFunction = listener
  }

  async Publish(input: T): Promise<void> {
    await this.topic.publishJSON({
      ...input,
      origin: this.serviceName
    })
  }

  async DebugIncomingMessage(listener: (message: any) => void) {
    // subscribe to topic
    const subscriptionName = 'debug-incoming-' + nanoid(5)
    await this.pubsub.createSubscription(this.topic.name, subscriptionName, {})
    const debugSubscription = this.topic.subscription(subscriptionName)
    debugSubscription.addListener('message', (message, ack) => {
      listener(message)
      ack()
    })
  }

  // @deprecated: no longer need to remove listeners, only use on delivery type pull only
  // currently we use push type to subscript message from pubsub
  UnsubscribeAll(): void {
    this.subscription.removeAllListeners('message')
  }

  // Express instance management method
  // if you want to extends server
  // please define new function here
  get NotificationRouter(): Router {
    let router = Router()

    const setRouter = (router: Router, path: string, listener: () => SubscribeListener<any>, log: ShioLogger) => {
      router.get(path, (req, res) => {
        res.status(200).end('ok')
      })

      router.post(path, (req, res) => {
        if (!listener()) {
          res.status(403).end(`${path} listener does not registered`)
          return
        }
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8')
        try {
          const f = listener()(JSON.parse(message), () => {
            res.status(200).send()
          })
          if (f && typeof f.then === 'function') {
            f.then()
          }
        } catch (e) {
          // HANDLE INVALID PAYLOAD
          log
            .withFields({
              body: JSON.stringify(req.body),
              payloadMessage: message,
              error: e
            })
            .error(`${path} message handle error`)
          res.status(200).end()
        }
      })
    }

    setRouter(
      router,
      this.notificationPath,
      () => {
        return this.listenerFunction
      },
      this.log
    )

    return router
  }

  // Cloud pubsub topic management utility function
  // to prepare pubsub for service
  // use this utility function before service start
  // these functions must use outside service instance
  // eg. on migration script, cron, or deployment manager

  async CreateSubscriptionConfig(pushEndpointHost: string) {
    this.log.info(`Update subscription config endpoint ${pushEndpointHost}`)
    const isExists = await this.subscription.exists()
    if (!isExists[0]) {
      await this.topic.createSubscription(this.subscription.name, {
        pushConfig: {
          pushEndpoint: pushEndpointHost + this.notificationPath
        }
      })
    }
  }

  async PrepareTopic() {
    this.log.info('Prepare subscription channel message...')
    const [topics] = await this.pubsub.getTopics()
    this.log.info('Topic list')
    this.log.info(topics.map(t => t.name).join('\n'))
    await Promise.all([this.topic.get({ autoCreate: true })])
  }

  // purge method will remove subscription channel of
  // incoming and outgoing message and create new one
  // please aware that you need to re subscribe the subscription
  // channel again after purge
  async Purge() {
    this.log.info('Purge subscription channel message...')
    this.UnsubscribeAll()

    if ((await this.topic.exists())[0] && (await this.subscription.exists())[0]) {
      await this.subscription.delete()
    }
  }
}

export type CloudPubsubChannelOptions = {
  pubsub: PubSub
  serviceName: string
}

export type TopicOptions = {
  topicName: string
  subscriptionName: string
  notificationPath: string
}
