import setup from '@shio-bot/foundation/__test__/integration-setup'
import { bootstrap } from '../app'
import { createPubsubIntegrationClient } from './pubsub'
import { GetEnvConfig } from '@shio-bot/foundation';

export default async () => {
  console.log('setup fulfillment integration test')
  await setup()
  const  config = GetEnvConfig()
  const { pubsub } = await createPubsubIntegrationClient()
  await pubsub.Purge()
  await pubsub.CreateIncomingSubscriptionConfig(config.host)

  const app = await bootstrap({
    ...config,
    dev: true
  })
  global.app = app
}
