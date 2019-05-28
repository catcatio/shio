import { DatastoreUserRepository } from '../user'
import { WithSystemOperation, WithWhere, WithOperationOwner } from '../common'
import { createDatastoreInstance, WithDatastoreAPIEndpoint } from '@shio/foundation';

describe('DatastoreUserRepository test', () => {
  let userRepo: DatastoreUserRepository
  const datastore = createDatastoreInstance(
    WithDatastoreAPIEndpoint('http://localhost:5545')
  )
  beforeAll(async () => {
    userRepo = new DatastoreUserRepository(datastore)
  })

  it('should create user, grant permission to self viewing and remove user correctly', async () => {
    const k = await userRepo.create(
      {
        displayName: 'TEST_USER'
      },
      WithSystemOperation()
    )
    const user = await userRepo.findById(k.id, WithOperationOwner(k.id))
    expect(user!.displayName).toEqual("TEST_USER")
    await userRepo.remove(
      WithWhere({
        displayName: {
          Equal: 'TEST_USER'
        }
      }),
      WithSystemOperation(),
    )
  })
})
