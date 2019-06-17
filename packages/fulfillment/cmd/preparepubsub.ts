import { createCloudPubSubInstance, WithPubsubProjectId, WithPubsubEndpoint, CloudPubsubMessageChannelTransport, GetEnvString, GetEnvConfig } from '@shio-bot/foundation'
import { CloudPubsubPaymentChannelTransport } from '@shio-bot/foundation/transports/pubsub'

async function prepare() {
  const envConfig = GetEnvConfig()

  const ps = await createCloudPubSubInstance(WithPubsubProjectId(envConfig.projectId), WithPubsubEndpoint(envConfig.pubsubEndpoint))

  const pubsub = new CloudPubsubMessageChannelTransport({
    pubsub: ps,
    serviceName: 'fulfillment-prepare'
  })
  await pubsub.PrepareTopic()
  await pubsub.CreateIncomingSubscriptionConfig(envConfig.host)

  const paymentPubsub = new CloudPubsubPaymentChannelTransport({
    pubsub: ps,
    serviceName: 'fulfillment-prepare'
  })
  await paymentPubsub.PrepareTopic()
  await paymentPubsub.CreateIncomingSubscriptionConfig(envConfig.host)
}

prepare()
