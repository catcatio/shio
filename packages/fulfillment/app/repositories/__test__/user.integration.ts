import { DatastoreUserRepository } from '../user'
import { WithSystemOperation, WithWhere, WithOperationOwner } from '../common'
import { createDatastoreInstance, WithDatastoreAPIEndpoint } from '@shio-bot/foundation'
import { User } from '../../entities'

describe('DatastoreUserRepository test', () => {
  let userRepo: DatastoreUserRepository
  beforeAll(async () => {
    const datastore = await createDatastoreInstance(WithDatastoreAPIEndpoint('http://localhost:5545'))
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
    expect(user!.displayName).toEqual('TEST_USER')
    await userRepo.remove(
      WithWhere<User>({
        displayName: {
          Equal: 'TEST_USER'
        }
      }),
      WithSystemOperation()
    )
  })
})
