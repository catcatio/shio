import setup from '@shio-bot/foundation/__test__/integration-setup'
import { bootstrap } from '../app'
import config from './config'
import { createPubsubIntegrationClient } from './pubsub'

export default async () => {
  console.log('setup fulfillment integration test')
  await setup()
  const { pubsub } = await createPubsubIntegrationClient()
  await pubsub.purge()
  await pubsub.prepareTopic()
  await pubsub.setIncomingSubscriptionConfig(config.host)

  const app = await bootstrap({
    ...config
  })
  global.app = app
}
