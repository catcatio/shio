import { server } from './server'
import { Configurations, PubSubSettings } from './types'
import { chatEndpoint } from './endpoints/chat'
import {
  createCloudPubSubInstance,
  WithClientConfig,
  CloudPubsubMessageChannelTransport,
  MessageChannelTransport,
  PublishIncommingMessageInput,
  SubscribeIncomingMessageListener,
  PublishOutgoingMessageInput,
  SubscribeOutgoingMessageListener
} from '@shio-bot/foundation'
import { ChatEngine } from '@shio-bot/chatengine'
import { fulfillment } from './fulfillment'
import { intentMessageHandler, fulfillmentMessageHandler } from './handlers'

class EchoPubSubTransport implements MessageChannelTransport {
  private incomingMessageListener: SubscribeIncomingMessageListener[] = []
  private outcomingMessageListener: SubscribeOutgoingMessageListener[] = []

  constructor() {
    this.SubscribeIncommingMessage(
      ((input: PublishIncommingMessageInput, ack: () => void) => {
        this.onIncomingMessage(input, ack)
      }).bind(this)
    )
  }

  private onIncomingMessage(input: PublishIncommingMessageInput, ack: () => void) {
    let fulfillment: any = {
      name: input.intent.name,
      parameters: {
        isCompleted: true
      }
    }

    this.PublishOutgoingMessage({
      fulfillment: [fulfillment],
      provider: input.provider,
      replyToken: input.replyToken,
      languageCode: input.languageCode,
      source: input.source,
      requestId: input.requestId
    })
    ack()
  }

  async PublishIncommingMessage(input: PublishIncommingMessageInput): Promise<void> {
    this.incomingMessageListener.forEach(listener => listener.bind(this)(input, () => {}))
  }
  SubscribeIncommingMessage(listener: SubscribeIncomingMessageListener): void {
    this.incomingMessageListener.push(listener)
  }
  UnsubscribeAllIncomingMessage(): void {
    this.incomingMessageListener = []
  }
  async PublishOutgoingMessage(input: PublishOutgoingMessageInput): Promise<void> {
    this.outcomingMessageListener.forEach(listener => listener(input, () => {}))
  }
  SubscribeOutgoingMessage(listener: SubscribeOutgoingMessageListener): void {
    this.outcomingMessageListener.push(listener)
  }
  UnsubscribeAllOutgoingMessage(): void {
    this.outcomingMessageListener = []
  }
}

const createPubsubTransportInstance = async (settings: PubSubSettings, serviceName: string): Promise<MessageChannelTransport> => {
  if (settings.devPubSub) {
    return new EchoPubSubTransport()
  }

  let pubsub = await createCloudPubSubInstance(WithClientConfig(settings.cloudPubSub || {}))

  return new CloudPubsubMessageChannelTransport({ pubsub, serviceName })
}

export async function bootstrap(config: Configurations) {
  let chatEngine = new ChatEngine(config.chatEngine)
  let cloudPubSub = await createPubsubTransportInstance(config.pubsub, config.serviceName)
  let ff = fulfillment(cloudPubSub)

  let intentDetector = chatEngine.intentDetectorProvider.get(config.intentProvider)

  let inMsgHandler = intentMessageHandler(ff, intentDetector, chatEngine.messagingClientProvider)
  let outMsgHandler = fulfillmentMessageHandler(chatEngine.messagingClientProvider)

  ff.onFulfillment(outMsgHandler)
  chatEngine.onMessageReceived(inMsgHandler.handle)

  let eps = [chatEndpoint(chatEngine)]

  return server(config, ...eps)
    .start()
    .then(_ => console.log('D O N E'))
    .catch(err => console.error(err))
}
