import { server } from './server'
import { Configurations, Endpoint } from './types'
import { chatEndpoint } from './endpoints/chat'
import { LineRequestHandler, LineMessageParser, LineMessagingClient } from '@shio-bot/chatengine/line'
import { createCloudPubSubInstance, WithClientConfig, CloudPubsubMessageChannelTransport as CloudPubsubTransport } from '@shio-bot/foundation'
import { ChatEngine, DialogFlowIntentDetector } from '@shio-bot/chatengine'
import { fulfillment } from './fulfillment'
import { intentMessageHandler, fulfillmentMessageHandler } from './handlers'

export async function bootstrap(config: Configurations) {
  const channelSecret = config.chatEngine.line.clientConfig.channelSecret
  let requestHandler = new LineRequestHandler(channelSecret)
  let messageParser = new LineMessageParser()
  let chatEngine = new ChatEngine(requestHandler, messageParser)

  let intentDetector = new DialogFlowIntentDetector(config.chatEngine.dialogflow)

  let pubsub = await createCloudPubSubInstance(WithClientConfig(config.pubsub))
  let cloudPubSub = new CloudPubsubTransport({ pubsub, serviceName: config.serviceName })
  let ff = fulfillment(cloudPubSub)

  let lineClient = new LineMessagingClient(config.chatEngine.line)

  let inMsgHandler = intentMessageHandler(intentDetector, ff)
  let outMsgHandler = fulfillmentMessageHandler(lineClient)

  // chatEngine
  // intentDetector
  // fullfillment
  // MessagingClient

  ff.onFulfillment(outMsgHandler)
  chatEngine.onMessageReceived(inMsgHandler.handle)

  let eps = [chatEndpoint(chatEngine)]

  return server(config, ...eps)
    .start()
    .then(_ => console.log('D O N E'))
    .catch(err => console.error(err))
}
