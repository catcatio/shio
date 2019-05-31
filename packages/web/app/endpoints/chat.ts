import { ChatEngine } from '@shio-bot/chatengine'
import { Endpoint } from '../types'
import * as express from 'express'

// NC:TODO: return custome handler instead of Router
export const chatEndpoint = (chatEngine: ChatEngine): Endpoint => {
  let router = express.Router()
  // NC:TODO: move /line path to chat engine
  router.post('/line', chatEngine.middleware.bind(chatEngine), (req, res) => {
    res.send('OK')
  })

  let endpoint: Endpoint = router as any
  endpoint.path = '/chat'

  return endpoint
}
