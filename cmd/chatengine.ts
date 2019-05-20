import * as express from 'express'
import { ChatEngine, LineRequestHandler, LineMessageParser } from 'chatengine'
import * as bodyParser from 'body-parser'

const start = async () => {
  // const channelSecret = 'not_very_secret'
  const channelSecret = 'test_secret'
  let requestHandler = new LineRequestHandler(channelSecret)
  let messageParser = new LineMessageParser()
  let chatEngine = new ChatEngine(requestHandler, messageParser)
  let app = express()
  app.use(bodyParser())

  chatEngine.onMessageReceived((msg) => {
    console.log('xxx')
    console.log(msg)
  })

  app.post('/', chatEngine.middleware.bind(chatEngine), (req, res) => {res.send('OK')})

  app.listen('3000', (err) => {
    if (err) {
      console.error(err)
      return
    }

    console.log('http://localhost:3000')
  })
}

start()
  .then(_ => console.log('D O N E'))
  .catch(err => console.error(err))