
import teardown from '@shio/foundation/__test__/integration-teardown'
export default async () => {
  console.log('teardown fulfillment integration test')
  global.app.close()
  await teardown()
} 