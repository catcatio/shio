import { createPubsubIntegrationClient, runFixtureSteps } from './pubsub'
import './expect-extend'
import { UnPromise, INTEGRATION_USER } from '../app/entities'
import { follow } from './fixture/boarding'
import { FollowEventMessageFulfillmentKind, ListItemEventMessageIntentParameterFilter, ListItemEventMessageFulfillmentKind } from '@shio-bot/foundation/entities'
import { listItem } from './fixture/list-item'
import config from './config'
import { createDatastoreInstance, WithDatastoreAPIEndpoint, WithDatastoreNameSpace, WithDatastoreProjectId, FileStorage, LocalFileStorage } from '@shio-bot/foundation'
import { DatastoreAssetRepository, WithSystemOperation, WithOperationOwner } from '../app'
import { randomCreateAssetInput, randomAssetMetadata } from '../app/helpers/random'
import { Datastore } from '@google-cloud/datastore'

const nanoid = require('nanoid')

describe('fulfillment service integration test', () => {
  let outgoingPubsub: UnPromise<ReturnType<typeof createPubsubIntegrationClient>>
  let datastore: Datastore
  let storage: FileStorage
  let Asset: DatastoreAssetRepository
  jest.setTimeout(60 * 1000)

  beforeAll(async () => {
    outgoingPubsub = await createPubsubIntegrationClient()
    storage = new LocalFileStorage()
    datastore = await createDatastoreInstance(
      WithDatastoreAPIEndpoint(config.datastoreEndpoint!),
      WithDatastoreNameSpace(config.datastoreNamespace),
      WithDatastoreProjectId(config.projectId)
    )

    Asset = new DatastoreAssetRepository(datastore, storage)
    await outgoingPubsub.start()
  })

  test('follow user must be able to create new profile and return exists = true if exists', async () => {
    await runFixtureSteps(
      {
        provider: 'facebook',
        userId: 'integration-test-1' + nanoid(5),
        variables: {}
      },
      outgoingPubsub
    )(
      follow({ displayName: 'integration aim' }, (resultMessage, ctx) => {
        expect(resultMessage.source.userId).toEqual(ctx.userId)
        expect(resultMessage).toMatchFulfillment(FollowEventMessageFulfillmentKind, fulfillment => {
          expect(fulfillment.parameters.userId).toBeDefined()
          expect(fulfillment.parameters.chatSessionId).toBeDefined()
          expect(fulfillment.parameters.isCompleted).toBeTruthy()
        })
      }),
      follow({ displayName: '' }, (result, ctx) => {
        expect(result).toMatchFulfillment(FollowEventMessageFulfillmentKind, f => {
          expect(f.parameters.isExists).toBeTruthy()
        })
      })
    )
  })

  test('list asset from store', async () => {
    // Create a few asset in the store
    // before testing
    const asset1 = randomCreateAssetInput(randomAssetMetadata())
    const asset2 = randomCreateAssetInput(randomAssetMetadata())
    await Asset.create(asset1)
    await Asset.create(asset2)

    await runFixtureSteps(
      {
        provider: 'line',
        userId: nanoid(10),
        variables: {}
      },
      outgoingPubsub
    )(
      follow({ displayName: 'list asset test' }),
      listItem({ filter: ListItemEventMessageIntentParameterFilter.RECENT }, result => {
        expect(result).toMatchFulfillment(ListItemEventMessageFulfillmentKind, fulfillment => {
          expect(fulfillment.parameters.assets.length).toEqual(2)
        })
      })
    )
  })

  afterAll(async () => {
    await Asset.remove(WithOperationOwner(INTEGRATION_USER))
    await outgoingPubsub.clean()
  })
})
