import { createPubsubIntegrationClient, runFixtureSteps, expectFulfillment } from './pubsub'
import './expect-extend'
import { UnPromise, INTEGRATION_USER } from '../app/entities'
import { follow } from './fixture/boarding'
import { FollowEventMessageFulfillmentKind, ListItemEventMessageIntentParameterFilter, ListItemEventMessageFulfillmentKind, isReservePaymentMessage, isIntentOfKind, ClaimFreeItemEventMessageIntentKind, isFulfillmentOfKind, ClaimFreeItemEventMessageFulfillmentKind } from '@shio-bot/foundation/entities'
import { listItem } from './fixture/list-item'
import { createDatastoreInstance, WithDatastoreAPIEndpoint, WithDatastoreNameSpace, WithDatastoreProjectId, FileStorage, LocalFileStorage, GetEnvConfig } from '@shio-bot/foundation'
import { DatastoreAssetRepository, WithSystemOperation, WithOperationOwner } from '../app'
import { randomCreateAssetInput, randomAssetMetadata } from '../app/helpers/random'
import { Datastore } from '@google-cloud/datastore'
import { purchaseItem } from './fixture/purchase';
import { claimFreeItem } from './fixture/claim-free.item';

const nanoid = require('nanoid')

describe('fulfillment service integration test', () => {
  let outgoingPubsub: UnPromise<ReturnType<typeof createPubsubIntegrationClient>>
  let datastore: Datastore
  let storage: FileStorage
  let Asset: DatastoreAssetRepository
  jest.setTimeout(60 * 1000)

  beforeAll(async () => {
    const config = GetEnvConfig()
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
        expect(resultMessage).toMatchFulfillment(FollowEventMessageFulfillmentKind, fulfillment => {
          expect(resultMessage.source!).toBeDefined()
          expect(resultMessage.source!.userId).toEqual(ctx.userId)
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

  test('list asset from store get free item, confirm claim free item', async () => {
    // Create a few asset in the store
    // before testing
    const asset1 = randomCreateAssetInput(randomAssetMetadata())
    const asset2 = randomCreateAssetInput(randomAssetMetadata())
    asset2.price = 0
    await Asset.create(asset1)
    const asset2Result = await Asset.create(asset2)
    console.log(asset2Result)

    let orderId: string = ""
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
      }),
      purchaseItem({
        assetId: asset2Result.id,
      }, (result) => {
        expect(isReservePaymentMessage(result)).toBeTruthy()
        if (isReservePaymentMessage(result)) {
          orderId = result.orderId
          console.log("order ID is " + orderId)
          expect(result.amount).toEqual(asset2.price)
          expect(result.orderId).not.toEqual("")
          expect(result.orderId).not.toBeUndefined()
        }
      }),
      claimFreeItem((ctx) => ({ orderId }), (result) => {
        expect(result).toMatchFulfillment(ClaimFreeItemEventMessageFulfillmentKind, (f) => {
          expect(isFulfillmentOfKind(ClaimFreeItemEventMessageFulfillmentKind, f)).toBeTruthy()
          if (isFulfillmentOfKind(ClaimFreeItemEventMessageFulfillmentKind, f)) {
            expect(f.parameters.assetId).toEqual(asset2Result.id)
          }
        })
      }),
      listItem({ filter: ListItemEventMessageIntentParameterFilter.RECENT}, (result) => {
        expect(result).toMatchFulfillment(ListItemEventMessageFulfillmentKind, (f) => {
          f.parameters.assets.forEach(asset => {
            if(asset.id === asset2Result.id) {
              expect(asset.isOwnByOperationOwner).toBeTruthy()
            }
          })

        })
      })
    )


  })

  afterAll(async () => {
    await Asset.remove(WithOperationOwner(INTEGRATION_USER))
    await outgoingPubsub.clean()
  })
})
