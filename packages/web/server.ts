import * as express from 'express'
import { Router } from 'express'
import { Configurations } from './types'
import { LineRequestHandler, LineMessageParser, ChatEngine, DialogFlowIntentDetector } from '@shio-bot/chatengine'
import { LineMessagingClient } from '@shio-bot/chatengine/line/messagingClient'
import * as bodyParser from 'body-parser'
import { incomingMessageHandler, outgoingMessageHandler } from './handlers';
import { CloudPubsubTransport, createCloudPubSubInstance, WithGoogleAuthOptions } from '../foundation';

export const chatEndpoint = (config: Configurations): Router => {
  const channelSecret = config.chatEngine.line.clientConfig.channelSecret
  let requestHandler = new LineRequestHandler(channelSecret)
  let messageParser = new LineMessageParser()
  let chatEngine = new ChatEngine(requestHandler, messageParser)
  let intentDetector = new DialogFlowIntentDetector(config.chatEngine.dialogflow)
  let pubsub = createCloudPubSubInstance(WithGoogleAuthOptions(config.pubsub))
  let cloudPubSub = new CloudPubsubTransport(pubsub, config.serviceName)
  let lineClient = new LineMessagingClient(config.chatEngine.line)
  let inMsgHandler = incomingMessageHandler(intentDetector, cloudPubSub)
  let outMsgHandler = outgoingMessageHandler(lineClient)


  cloudPubSub.SubscribeOutgoingMessage(outMsgHandler)
  chatEngine.onMessageReceived(inMsgHandler.handle)

  let router: Router = express.Router()

  // NC:TODO: move this to chat engine
  router.post('/line', chatEngine.middleware.bind(chatEngine), (req, res) => { res.send('OK') })
  return router
}

export const server = (config: Configurations) => {
  const start = async () => new Promise((resolve, reject) => {
    let app = express()
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use('/chat', chatEndpoint(config))

    app.listen(config.port, () => {
      console.log(`started on ${config.port}`)
      resolve(true)
    })
  })

  return {
    start
  }
}
