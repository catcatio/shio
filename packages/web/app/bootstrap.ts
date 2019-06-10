import { server } from './server'
import { Configurations, PubSubSettings, Endpoint } from './types'
import { chatEndpoint } from './endpoints/chat'
import { createCloudPubSubInstance, WithClientConfig, CloudPubsubMessageChannelTransport } from '@shio-bot/foundation'
import { ChatEngine } from '@shio-bot/chatengine'
import { fulfillment } from './fulfillment'
import { intentMessageHandler, fulfillmentMessageHandler } from './handlers'
import { EchoPubSubTransport, MessageChannelTransportExt } from './internal'

const msgPubsubPath = '/msgpubsub'

const createPubsubTransportInstance = async (settings: PubSubSettings, serviceName: string): Promise<MessageChannelTransportExt> => {
  if (settings.devPubSub) {
    return new EchoPubSubTransport()
  }

  let pubsub = await createCloudPubSubInstance(WithClientConfig(settings.cloudPubSub || {}))
  return new CloudPubsubMessageChannelTransport({ pubsub, serviceName })
}

function makePubsubEndpoint(pubsub: MessageChannelTransportExt): Endpoint {
  let ep: Endpoint = pubsub.NotificationRouter as any
  ep.path = msgPubsubPath
  return ep
}

export async function bootstrap(config: Configurations) {
  let chatEngine = new ChatEngine(config.chatEngine)
  let pubsub = await createPubsubTransportInstance(config.pubsub, config.serviceName)
  let ff = fulfillment(pubsub)
  let intentDetector = chatEngine.intentDetectorProvider.get(config.intentProvider)

  let inMsgHandler = intentMessageHandler(ff, intentDetector, chatEngine.messagingClientProvider)
  let outMsgHandler = fulfillmentMessageHandler(chatEngine.messagingClientProvider)

  pubsub.CreateOutgoingSubscriptionConfig(`${config.host}${msgPubsubPath}`)
  ff.onFulfillment(outMsgHandler)

  chatEngine.onMessageReceived(inMsgHandler.handle)

  let eps: Endpoint[] = [chatEndpoint(chatEngine), makePubsubEndpoint(pubsub)]
  return server(config, ...eps)
    .start()
    .then(_ => console.log('D O N E'))
    .catch(err => console.error(err))
}
