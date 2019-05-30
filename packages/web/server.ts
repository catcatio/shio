import * as express from 'express'
import { Router } from 'express'
import { Configurations } from './types'
import { LineRequestHandler, LineMessageParser, ChatEngine, DialogFlowIntentDetector } from '@shio/chatengine'
import * as bodyParser from 'body-parser'
import { incomingMessageHandler } from './handlers';

export const chatEndpoint = (config: Configurations): Router => {
  const channelSecret = config.chatEngine.line.clientConfig.channelSecret
  let requestHandler = new LineRequestHandler(channelSecret)
  let messageParser = new LineMessageParser()
  let chatEngine = new ChatEngine(requestHandler, messageParser)
  let intentDetector = new DialogFlowIntentDetector(config.chatEngine.dialogflow)
  let messageHandler = incomingMessageHandler(intentDetector)

  chatEngine.onMessageReceived((msg) => {
    messageHandler.handle(msg)
  })

  let router: Router = express.Router()

  // TODO: move this to chat engine
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
