import { DatastoreACLRepository } from '../acl'
import { CreateDatastoreInstance } from '../../tools'
import { newResourceTag, Permission } from '../../entities'
import { WithSystemOperation } from '../common';

describe('DatastoreACLRepository test', () => {
  let aclrepo: DatastoreACLRepository
  const datastore = CreateDatastoreInstance('http://localhost:5545')
  beforeAll(async () => {
    aclrepo = new DatastoreACLRepository(datastore)
  })

  it('should create ACL record by specific resouce ID', async () => {
    const testTag = newResourceTag('test-something', '001')
    await aclrepo.CreatePermission('N0002', testTag, Permission.VIEWER, WithSystemOperation())
    await aclrepo.GetPermissionOrThrow('N0002', testTag, Permission.VIEWER)

    await aclrepo.IsGrantedOrThrow('N0002', testTag, Permission.VIEWER)
    expect(aclrepo.IsGrantedOrThrow('N0002', testTag, Permission.OWNER)).rejects.toThrow()
    expect(aclrepo.IsGrantedOrThrow('N0002', newResourceTag('test-something'), Permission.OWNER)).rejects.toThrow()
    await aclrepo.RevokeAllPermissionFromResource('N0002', testTag, WithSystemOperation())
    expect(aclrepo.IsGrantedOrThrow('N0002', testTag, Permission.VIEWER)).rejects.toThrow()
  })

  it('should create ACL record by wildcard resource ID', async () => {
    const testTag = newResourceTag('test-something')
    await aclrepo.CreatePermission('N0002', testTag, Permission.VIEWER, WithSystemOperation())
    await aclrepo.GetPermissionOrThrow('N0002', testTag, Permission.VIEWER)
    await aclrepo.IsGrantedOrThrow('N0002', testTag.withId('some-id'), Permission.VIEWER)
    await aclrepo.RevokeAllPermissionFromResource('N0002', testTag, WithSystemOperation())
  })

  afterAll(async () => {
  })
})
