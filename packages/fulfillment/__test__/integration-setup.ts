import setup from '@shio/foundation/__test__/integration-setup'
import { bootstrap } from '../app'
import config from './config'
import { createPubsubIntegrationClient } from './pubsub';

export default async () => {

  console.log('setup fulfillment integration test')
  await setup()
  const {pubsub} = createPubsubIntegrationClient()
  await pubsub.purge()
  const app = await bootstrap({
    ...config
  })
  global.app = app
}
