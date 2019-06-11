import { server } from './server'
import { Configurations, PubSubSettings, Endpoint } from './types'
import { chatEndpoint } from './endpoints/chat'
import { createCloudPubSubInstance, WithClientConfig, CloudPubsubMessageChannelTransport, newLogger } from '@shio-bot/foundation'
import { ChatEngine, PaymentEngine } from '@shio-bot/chatengine'
import { fulfillment } from './fulfillment'
import { intentMessageHandler, fulfillmentMessageHandler } from './handlers'
import { EchoPubSubTransport, MessageChannelTransportExt, PaymentChannelTransportExt } from './internal'
import { paymentEndpoint } from './endpoints/payment'
import { CloudPubsubPaymentChannelTransport, PaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'
import { payment } from './payment'
import { reservePaymentHandler } from './handlers/reservePaymentHandler'
import { confirmPaymentHandler } from './handlers/confirmPaymentHandler'
import { paymentRepository } from './repositories'

const pubsubPath = '/pubsub'

const createPubsubMessageTransportInstance = async (settings: PubSubSettings, serviceName: string): Promise<MessageChannelTransportExt> => {
  if (settings.devPubSub) {
    return new EchoPubSubTransport()
  }

  let pubsub = await createCloudPubSubInstance(WithClientConfig(settings.cloudPubSub || {}))
  return new CloudPubsubMessageChannelTransport({ pubsub, serviceName })
}

const createPubsubPaymentTransportInstance = async (settings: PubSubSettings, serviceName: string): Promise<PaymentChannelTransportExt> => {
  let pubsub = await createCloudPubSubInstance(WithClientConfig(settings.cloudPubSub || {}))
  return new CloudPubsubPaymentChannelTransport({ pubsub, serviceName })
}

function makeMessagePubsubEndpoint(pubsub: MessageChannelTransportExt): Endpoint {
  let ep: Endpoint = pubsub.NotificationRouter as any
  ep.path = pubsubPath
  return ep
}

function makePaymentPubsubEndpoint(pubsub: PaymentChannelTransportExt): Endpoint {
  let ep: Endpoint = pubsub.NotificationRouter as any
  ep.path = pubsubPath
  return ep
}

export async function bootstrap(config: Configurations) {
  let log = newLogger()
  log.info('bootstrapping')
  let chatEngine = new ChatEngine(config.chatEngine)
  let paymentEngine = new PaymentEngine(config.chatEngine)
  let msgPubsub = await createPubsubMessageTransportInstance(config.pubsub, config.serviceName)
  let paymentPubsub = await createPubsubPaymentTransportInstance(config.pubsub, config.serviceName)
  let ff = fulfillment(msgPubsub)
  let pm = payment(paymentPubsub)
  let intentDetector = chatEngine.intentDetectorProvider.get(config.intentProvider)

  let inMsgHandler = intentMessageHandler(ff, intentDetector, chatEngine.messagingClientProvider)
  let outMsgHandler = fulfillmentMessageHandler(chatEngine.messagingClientProvider)
  msgPubsub.CreateOutgoingSubscriptionConfig(`${config.host}${pubsubPath}`)
  ff.onFulfillment(outMsgHandler)

  let confirmUrl = config.chatEngine.linepay ? config.chatEngine.linepay.confirmUrl : ''

  let paymentRepo = paymentRepository()
  let rpHandler = reservePaymentHandler(confirmUrl, pm, chatEngine.messagingClientProvider, paymentEngine.paymentClientProvider, paymentRepo)
  let cpHandler = confirmPaymentHandler(pm, chatEngine.messagingClientProvider, paymentRepo)
  paymentPubsub.CreateOutgoingSubscriptionConfig(`${config.host}${pubsubPath}`)
  pm.onReservePayment(rpHandler)

  chatEngine.onMessageReceived(inMsgHandler.handle)
  paymentEngine.onPaymentConfirmationReceived(cpHandler.handle)

  let eps: Endpoint[] = [chatEndpoint(chatEngine), paymentEndpoint(paymentEngine), makeMessagePubsubEndpoint(msgPubsub), makePaymentPubsubEndpoint(paymentPubsub)]

  process.on('uncaughtException', function(err) {
    console.log('THIS IS BAD:', err)
  })

  return server(config, ...eps)
    .start()
    .then(_ => console.log('D O N E'))
    .catch(err => console.error(err))
}
