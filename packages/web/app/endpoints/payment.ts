import { PaymentEngine } from '@shio-bot/chatengine'
import { Endpoint } from '../types'

export const paymentEndpoint = (paymentEngine: PaymentEngine): Endpoint => {
  let router = paymentEngine.buildRouter()
  let endpoint: Endpoint = router as any
  endpoint.path = '/payment'

  return endpoint
}
