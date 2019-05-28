import { Datastore } from '@google-cloud/datastore'
import { newGlobalError, ErrorType } from '../entities/error'
import { Omit } from '../entities/common'
import { Permission, ACL, newResourceTag, SYSTEM_USER, ResourceTag } from '../entities/acl'
import { RepositoryOperationOption, composeRepositoryOptions, WithSystemOperation } from './common'

export type ACLRepositoryOperationOption = RepositoryOperationOption<ACL>
export interface ACLRepository {
  IsGranted(userId: string, resourceTag: ResourceTag, permission: Permission): Promise<boolean>
  IsGrantedOrThrow(userId: string, resourceTag: ResourceTag, permission: Permission): Promise<boolean>

  GetPermission(userId: string, resourceTag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<ACL | undefined>
  GetPermissionOrThrow(userId: string, resourceTag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<ACL>
  CreatePermission(userId: string, resourceTag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<void>

  RevokeAllPermissionFromResource(userId: string, resourceTag: ResourceTag, ...opts: ACLRepositoryOperationOption[]): Promise<void>
}

export class DatastoreACLRepository implements ACLRepository {
  async RevokeAllPermissionFromResource(userId: string, resourceTag: ResourceTag, ...opts: RepositoryOperationOption<ACL>[]): Promise<void> {
    const options = composeRepositoryOptions(...opts)
    await this.IsGranted(options.operationOwnerId, newResourceTag('acl'), Permission.OWNER)
    const key = this.getACLKey(userId, resourceTag)
    await this.db.delete(key)
  }
  private db: Datastore
  private ACLKind = 'acl'

  public prepare() {
    return Promise.all([
      this.CreatePermission(SYSTEM_USER, newResourceTag('acl', '*'), Permission.OWNER, WithSystemOperation()),
      this.CreatePermission(SYSTEM_USER, newResourceTag('user', '*'), Permission.OWNER, WithSystemOperation()),
      this.CreatePermission(SYSTEM_USER, newResourceTag('asset', '*'), Permission.OWNER, WithSystemOperation()),
      this.CreatePermission(SYSTEM_USER, newResourceTag('payment', '*'), Permission.OWNER, WithSystemOperation()),
      this.CreatePermission(SYSTEM_USER, newResourceTag('transaction', '*'), Permission.OWNER, WithSystemOperation())
    ])
  }

  constructor(datastore: Datastore) {
    this.db = datastore
  }

  async IsGrantedOrThrow(userId: string, resourceTag: ResourceTag, permission: Permission): Promise<boolean> {
    const isGranted = await this.IsGranted(userId, resourceTag, permission)
    if (!isGranted) {
      throw newGlobalError(ErrorType.Auth, `User ${userId} not allow to execute ${permission} to resource ${resourceTag}`)
    }
    return true
  }
  async IsGranted(userId: string, resourceTag: ResourceTag, permission: Permission): Promise<boolean> {
    if (userId === SYSTEM_USER) {
      return true
    }
    const wildCardTag = newResourceTag(resourceTag.type, '*')
    const acl = await Promise.all([
      this.GetPermission(userId, resourceTag, permission, WithSystemOperation()),
      this.GetPermission(userId, wildCardTag, permission, WithSystemOperation())
    ])
    return !!acl[0] || !!acl[1]
  }

  public getACLKey(userId: string, resourceTag: ResourceTag) {
    return this.db.key([this.ACLKind, `${userId}::${resourceTag.toString()}`])
  }

  async CreatePermission(userId: string, tag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<void> {
    const options = composeRepositoryOptions(...opts)
    await this.IsGrantedOrThrow(options.operationOwnerId, newResourceTag('acl'), Permission.WRITER)
    const key = this.getACLKey(userId, tag)
    const [existACL]: [ACL | undefined] = await this.db.get(key)
    const permissionSet = new Set<Permission>()
    permissionSet.add(permission)
    if (existACL) {
      existACL.permissions.forEach(p => permissionSet.add(p))
    }

    const acl: Omit<ACL, 'id'> = {
      userId,
      resourceId: tag.id,
      resourcePrefix: tag.prefix,
      resourceType: tag.type,
      permissions: Array.from(permissionSet),
      createdAt: new Date(),
      createdBy: options.operationOwnerId
    }

    await this.db.upsert({
      data: acl,
      key: key
    })
  }

  async GetPermissionOrThrow(userId: string, resourceTag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<ACL> {
    const acl = await this.GetPermission(userId, resourceTag, permission, ...opts)
    if (!acl) {
      throw newGlobalError(ErrorType.NotFound, `ACL Permission of ${userId} as ${permission} ${resourceTag} not found`)
    } else {
      return acl
    }
  }

  async GetPermission(userId: string, resourceTag: ResourceTag, permission: Permission, ...opts: ACLRepositoryOperationOption[]): Promise<ACL | undefined> {
    const options = composeRepositoryOptions(...opts)
    await this.IsGranted(options.operationOwnerId, newResourceTag('acl'), Permission.VIEWER)
    const query = this.db.createQuery(this.ACLKind).filter('__key__', this.getACLKey(userId, resourceTag))
    const [entities] = await this.db.runQuery(query)
    if (entities.length < 0) {
      return undefined
    }
    const acl = entities[0] as ACL
    if (acl) {
      if (acl.permissions.find(p => p === Permission.OWNER || p === permission)) {
        return acl
      } else {
        return undefined
      }
    }
    return acl
  }
}
