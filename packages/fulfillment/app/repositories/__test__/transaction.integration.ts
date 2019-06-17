import { DatastoreTransactionRepository } from "../transaction";
import { createDatastoreInstance, WithDatastoreProjectId, WithDatastoreNameSpace, WithDatastoreAPIEndpoint } from "@shio-bot/foundation";
import { Datastore } from "@google-cloud/datastore";
import { WithSystemOperation, WithWhere } from "../common";
import { TransactionStatus, Transaction } from "../../entities/transaction";
import { __mock__CloudPubsubPaymentTransports } from "@shio-bot/foundation/transports/__test__/mock";
import { LocalDatastoreEndpoint } from "../../helpers/datastore";

jest.setTimeout(60 * 1000)
describe('Asset', () => {

  let txRepo: DatastoreTransactionRepository
  let datastore: Datastore
  beforeAll(async () => {
    datastore = await createDatastoreInstance(
      // WithDatastoreProjectId('catcat-development'),
      // WithDatastoreNameSpace("local-dev"),
      WithDatastoreAPIEndpoint(LocalDatastoreEndpoint)
    )
    const pubsubPayment = new __mock__CloudPubsubPaymentTransports()
    txRepo = new DatastoreTransactionRepository(datastore)
  })

  const userId = "test-integration"

  test('create transaction, confirm payment', async () => {

    const tx = await txRepo.create(userId, "B01", 80, WithSystemOperation())
    await txRepo.createPayment(userId, tx.id, 'linepay', 80)
    await txRepo.updateById(userId, tx.id, {
      ...tx,
      status: TransactionStatus.COMPLETED,
      describeURLs: [],
    })

    const resultTx = await txRepo.findById(userId, tx.id)
    expect(resultTx).toBeDefined()
    expect(resultTx.id).toEqual(tx.id)
    expect(resultTx.status).toEqual(TransactionStatus.COMPLETED)

  })

  test('begin commit', async () => {
    let transactional = await txRepo.begin()
    const tx = await transactional.create(userId, "T00", 20)
    {
      const resultTx = await txRepo.findById(userId, tx.id)
      expect(resultTx).toBeUndefined()
      await transactional.commit()
    }
    {
      const resultTx = await txRepo.findById(userId, tx.id)
      expect(resultTx).toBeDefined()
    }
  })

  test('begin rollback', async () => {
    let transactional = await txRepo.begin()
    const tx = await transactional.create(userId, "T00", 20)
    await transactional.rollback()
    const resultTx = await txRepo.findById(userId, tx.id)
    expect(resultTx).toBeUndefined()
  })


  test('real use', async () => {
    const assetId = "R01"
    const price = 10
    let tx = await txRepo.create(userId, assetId, price)

    {
      // Payment accept
      const transactional = await txRepo.begin()
      tx = await transactional.findById(userId, tx.id)
      let payment = await transactional.createPayment(userId, tx.id, 'linepay', 10)
      await transactional.updateById(userId, tx.id, {
        ...tx,
        describeURLs: [],
        status: TransactionStatus.COMPLETED,
      })
      await transactional.commit()
    }

    {
      const queryResults = await txRepo.findMany(WithWhere<Transaction>({
        assetId: {
          Equal: assetId
        },
        userId: {
          Equal: userId,
        }
      }))
      expect(queryResults.length).toBeGreaterThanOrEqual(1)
    }
  })

})