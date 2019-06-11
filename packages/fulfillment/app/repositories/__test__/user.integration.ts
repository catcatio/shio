import { DatastoreUserRepository, CreateUserChatSessionInput } from '../user'
import { WithSystemOperation, WithWhere, WithOperationOwner } from '../common'
import { createDatastoreInstance, WithDatastoreAPIEndpoint, WithDatastoreNameSpace, WithDatastoreProjectId } from '@shio-bot/foundation'
import { Datastore } from '@google-cloud/datastore'
import * as uuid from 'uuid/v4'
import { User } from '../../entities'

jest.setTimeout(60 * 1000)
describe('DatastoreUserRepository test', () => {
  let userRepo: DatastoreUserRepository
  let datastore: Datastore
  beforeAll(async () => {
    datastore = await createDatastoreInstance(
      WithDatastoreNameSpace('catcat-local-dev'),
      WithDatastoreProjectId('catcat-development'),
      WithDatastoreAPIEndpoint('http://localhost:5545')
    )

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

    const chatSessionInput: CreateUserChatSessionInput = {
      provider: 'line',
      providerId: uuid().toString(),
      userId: user!.id
    }

    const chatSession = await userRepo.createChatSession(chatSessionInput)

    expect(chatSession).toBeDefined()
    // ห้ามสร้าง chatsession ซ้ำด้วย provider, providerId เดิม
    await expect(userRepo.createChatSession(chatSessionInput)).rejects.toBeTruthy()
    const chatSessionKey = await userRepo.getUserChatSessionKey(chatSession)
    const [chatSessionResult] = await datastore.get(chatSessionKey)
    const [userResult] = await datastore.get(chatSessionKey.parent)

    expect(chatSessionResult).toBeDefined()
    expect(userResult).toBeDefined()

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
