import { CreateDatastoreInstance } from '../app/tools/create-datastore'
import { DatastoreACLRepository, RunDatastoreMigration } from '../app/repositories'
import { Permission, newResourceTag, SYSTEM_USER } from '../app/entities/acl'
import { WithSystemOperation, WithWhere } from '../app/repositories/common'
import { equal } from 'assert'
import { DatastoreUserRepository } from '../app/repositories/user'

// if you want to use local development datastore server
// insert datastore endpoint to CrateDatastoreInstance
// example
// CraeteDatastoreInstance("http://localhost:8081")
// leave it blank if you want to connect to Gcloud Datastore (require gcloud sdk cli with login)
//
// const datastore = CreateDatastoreInstance( 'http://localhost:8081')
const datastore = CreateDatastoreInstance()

async function Run() {
  // Please cleanup after commit
  // if anything exists in this function
  // you can delete it without asking anyone

  const aclrepo = new DatastoreACLRepository(datastore)
  const userRepo = new DatastoreUserRepository(datastore)

  await RunDatastoreMigration(datastore, aclrepo)
  await aclrepo.CreatePermission('N01', newResourceTag('book', '01'), Permission.VIEWER, WithSystemOperation())
  await aclrepo.CreatePermission(SYSTEM_USER, newResourceTag('book', '*'), Permission.VIEWER, WithSystemOperation())
  await aclrepo.GetPermissionOrThrow('N01', newResourceTag('book', '01'), Permission.VIEWER, WithSystemOperation())
  await aclrepo.GetPermission('N01', newResourceTag('book', '01'), Permission.OWNER, WithSystemOperation())
  await userRepo.RemoveUser(WithSystemOperation())
  await userRepo.CreateUser(
    {
      displayName: 'AIM',
      providers: {
        lineId: 'N0002'
      }
    },
    WithSystemOperation()
  )
  await userRepo.CreateUser(
    {
      displayName: 'AIM',
      providers: {
        lineId: 'N0001'
      }
    },
    WithSystemOperation()
  )
  const user = await userRepo.FindOneUser(
    WithWhere({
      displayName: {
        Equal: 'AIM'
      }
    }),
    WithSystemOperation()
  )
  equal(user!.displayName, 'AIM')
  let isGranted = await aclrepo.IsGranted('N01', newResourceTag('book', '01'), Permission.OWNER)
  equal(isGranted, false)
  isGranted = await aclrepo.IsGranted('N01', newResourceTag('book', '01'), Permission.VIEWER)
  equal(isGranted, true)
  isGranted = await aclrepo.IsGranted(SYSTEM_USER, newResourceTag('book', '01'), Permission.VIEWER)
  equal(isGranted, true)
}

console.time('execution time')
Run()
console.timeEnd('execution time')
