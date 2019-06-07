import { ChatEngine } from '@shio-bot/chatengine'
import { Endpoint } from '../types'

export const chatEndpoint = (chatEngine: ChatEngine): Endpoint => {
  let router = chatEngine.buildRouter()
  let endpoint: Endpoint = router as any
  endpoint.path = '/chat'

  return endpoint
}
