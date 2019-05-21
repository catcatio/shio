import { User, UserChatSession } from '../entities/user'
import { RepositoryOperationOption, JoiObjectSchema, composeRepositoryOptions, WithWhere, WithSystemOperation } from './common'
import { Omit, PartialCommonAttributes, CommonAttributes, PaginationResult } from '../entities/common'
import { Datastore } from '@google-cloud/datastore'
import * as Joi from 'joi'
import { newGlobalError, ErrorType } from '../entities/error'
import { newResourceTag, Permission } from '../entities'
import { ACLRepository, DatastoreACLRepository } from './acl'
import { applyFilter } from './database/filter'
import { toJSON } from './database/toJSON'

export type UserRepositoryOperationOption = RepositoryOperationOption<User>

export type CreateUserInput = Omit<PartialCommonAttributes<User>, 'id' | 'aclTag'>
export type CreateUserChatSessionInput = Omit<PartialCommonAttributes<UserChatSession>, 'id'>
export interface UserRepository {
  CreateUser(input: CreateUserInput, ...options: UserRepositoryOperationOption[]): Promise<User>
  FindByUserId(id: string, ...options: UserRepositoryOperationOption[]): Promise<User | undefined>
  FindOneUser(...options: UserRepositoryOperationOption[]): Promise<User | undefined>
  FindManyUser(...options: UserRepositoryOperationOption[]): Promise<PaginationResult<User>>
  RemoveUser(...options: UserRepositoryOperationOption[]): Promise<number>
  CreateUserChatSession(input: CreateUserChatSessionInput, ...options: RepositoryOperationOption<UserChatSession>[]): Promise<UserChatSession>
}


export class DatastoreUserRepository implements UserRepository {
  async FindByUserId(id: string, ...options: UserRepositoryOperationOption[]): Promise<User | undefined> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, this.aclTag.withId(id), Permission.VIEWER)
    const [entities] = await this.db.get(this.getUserKey(id))
    return toJSON(entities)
  }
  private db: Datastore
  private acl: ACLRepository
  private UserKind = 'user'
  private UserChatSessionKind = 'user-chat-session'
  private aclTag = newResourceTag(this.UserKind)

  constructor(db: Datastore)
  constructor(db: Datastore, acl?: ACLRepository) {
    this.db = db
    if (acl) {
      this.acl = acl
    } else {
      this.acl = new DatastoreACLRepository(db)
    }
  }

  async CreateUserChatSession(input: CreateUserChatSessionInput, ...options: RepositoryOperationOption<User>[]): Promise<UserChatSession> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind, input.userId), Permission.WRITER)

    const k = this.getUserChatSessionKey(`${input.provider}.${input.providerId}`)
    input.createdAt = new Date()
    input.createdBy = option.operationOwnerId
    await this.db.upsert({
      key: k,
      data: {
        ...input
      }
    })
    const query = await this.db
      .createQuery(this.UserChatSessionKind)
      .filter('__key__', k)
      .limit(1)
    const [entities] = await this.db.runQuery(query)
    return toJSON(entities[0])
  }

  async FindManyUser(...options: RepositoryOperationOption<User>[]): Promise<PaginationResult<User>> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind), Permission.VIEWER)

    let query = applyFilter(this.db.createQuery(this.UserKind), option)
      .limit(option.limit)
      .offset(option.offset)

    const [entities] = await this.db.runQuery(query)
    return {
      records: entities.map(e => toJSON(e)),
      limit: option.limit,
      offset: option.offset
    }
  }

  async RemoveUser(...options: RepositoryOperationOption<User>[]): Promise<number> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind), Permission.OWNER)
    const users = await this.FindManyUser(...options, WithSystemOperation())
    await this.db.delete(users.records.map(user => this.getUserKey(user.id)))
    return users.records.length
  }

  private getUserChatSessionKey(chatSessionId: string) {
    if (Number.isInteger(parseInt(chatSessionId))) {
      return this.db.key([this.UserChatSessionKind, parseInt(chatSessionId)])
    } else {
      return this.db.key([this.UserChatSessionKind, chatSessionId])
    }
  }
  private getUserKey(userId: string) {
    if (Number.isInteger(parseInt(userId))) {
      return this.db.key([this.UserKind, parseInt(userId)])
    } else {
      return this.db.key([this.UserKind, userId])
    }
  }

  async FindOneUser(...options: RepositoryOperationOption<User>[]): Promise<User | undefined> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind), Permission.VIEWER)
    let query = applyFilter(this.db.createQuery(this.UserKind), option).limit(1)
    const [entities] = await this.db.runQuery(query, {})

    if (entities.length < 1) {
      return undefined
    }
    const output = entities[0]
    return toJSON(output)
  }

  CreateUserInputSchema: JoiObjectSchema<Omit<CreateUserInput, keyof CommonAttributes>> = {
    displayName: Joi.string(),
    stellarEncryptedSecretKey: Joi.string(),
    stellarPublicKey: Joi.string()
  }
  async CreateUser(input: CreateUserInput, ...option: UserRepositoryOperationOption[]): Promise<User> {
    const options = composeRepositoryOptions(...option)
    await this.acl.IsGrantedOrThrow(options.operationOwnerId, this.aclTag, Permission.WRITER)

    const JoiCreateUserInput = Joi.object().keys(this.CreateUserInputSchema)
    const { error, value } = JoiCreateUserInput.validate(input)
    if (error) {
      throw newGlobalError(error)
    }

    const ids = await this.db.allocateIds(this.db.key([this.UserKind]), 1)
    const key = ids[0][0]
    const data: Omit<User, 'id'> = {
      ...value,
      aclTag: this.aclTag.withId(key.id).toString(),
      createdAt: new Date(),
      createdBy: options.operationOwnerId
    }
    await Promise.all([
      this.db.upsert({
        key: key,
        data: data
      }),
      this.acl.CreatePermission(key.id, this.aclTag.withId(key.id), Permission.VIEWER, WithSystemOperation())
    ])
    await this.acl.CreatePermission(key.id, this.aclTag.withId(key.id), Permission.WRITER, WithSystemOperation())

    const [entities] = await this.db.get(key)
    return toJSON(entities)
  }
}
