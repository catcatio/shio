import { DatastoreACLRepository } from '../acl'
import { CreateDatastoreInstance } from '../../tools'
import { DatastoreUserRepository } from '../user'
import { WithSystemOperation, WithWhere, WithOperationOwner } from '../common'

describe('DatastoreUserRepository test', () => {
  let aclrepo: DatastoreACLRepository
  let userRepo: DatastoreUserRepository
  const datastore = CreateDatastoreInstance('http://localhost:8081')
  beforeAll(async () => {
    aclrepo = new DatastoreACLRepository(datastore)
    userRepo = new DatastoreUserRepository(datastore)
  })

  it('should create user, grant permission to self viewing and remove user correctly', async () => {
    const k = await userRepo.CreateUser(
      {
        displayName: 'TEST_USER'
      },
      WithSystemOperation()
    )
    await userRepo.FindByUserId(k.id, WithOperationOwner(k.id))
    await userRepo.RemoveUser(
      WithWhere({
        displayName: {
          Equal: 'TEST_USER'
        }
      }),
      WithSystemOperation()
    )
  })
})
