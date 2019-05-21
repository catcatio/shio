import { DatastoreACLRepository } from '../acl'
import { newResourceTag, Permission, SYSTEM_USER } from '../../entities'
import { Datastore } from '@google-cloud/datastore'
import { WithSystemOperation } from '../common'

export async function RunDatastoreMigration(datastore: Datastore, acl: DatastoreACLRepository) {
  console.time('Run migrate operation')
  await Promise.all([
    acl.CreatePermission(SYSTEM_USER, newResourceTag('acl', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('user', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('asset', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('payment', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('transaction', '*'), Permission.OWNER, WithSystemOperation())
  ])
  console.timeEnd('Run migrate operation')
}
