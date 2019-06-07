import * as Joi from 'joi'
import { User, UserChatSession } from '../entities/user'
import { RepositoryOperationOption, JoiObjectSchema, composeRepositoryOptions, WithWhere, WithSystemOperation } from './common'
import { Omit, PartialCommonAttributes, CommonAttributes } from '@shio-bot/foundation'
import { PaginationResult } from '@shio-bot/foundation/entities'
import { Datastore } from '@google-cloud/datastore'
import { newGlobalError } from '../entities/error'
import { newResourceTag } from '../entities'
import { toJSON, applyFilter } from '../helpers/datastore'

export type UserRepositoryOperationOption = RepositoryOperationOption<User>
export type UserChatSessionOperationOption = RepositoryOperationOption<UserChatSession>

export type CreateUserInput = Omit<PartialCommonAttributes<User>, 'id' | 'aclTag'>
export type CreateUserChatSessionInput = Omit<PartialCommonAttributes<UserChatSession>, 'id'>
export interface UserRepository {
  create(input: CreateUserInput, ...options: UserRepositoryOperationOption[]): Promise<User>
  findById(id: string, ...options: UserRepositoryOperationOption[]): Promise<User | undefined>
  findOne(...options: UserRepositoryOperationOption[]): Promise<User | undefined>
  findMany(...options: UserRepositoryOperationOption[]): Promise<PaginationResult<User>>
  remove(...options: UserRepositoryOperationOption[]): Promise<number>

  createChatSession(input: CreateUserChatSessionInput, ...options: RepositoryOperationOption<UserChatSession>[]): Promise<UserChatSession>
  findOneChatSession(...options: UserChatSessionOperationOption[]): Promise<UserChatSession | undefined>
}

export class DatastoreUserRepository implements UserRepository {
  async findOneChatSession(...options: RepositoryOperationOption<UserChatSession>[]): Promise<UserChatSession | undefined> {
    const option = composeRepositoryOptions(...options)
    let query = applyFilter(this.db.createQuery(this.UserChatSessionKind), option)
      .limit(option.limit)
      .offset(option.offset)

    const [entities] = await this.db.runQuery(query)
    if (entities.length < 1) {
      return undefined
    }
    const output = entities[0]
    return toJSON(output)
  }

  async findById(id: string, ...options: UserRepositoryOperationOption[]): Promise<User | undefined> {
    const option = composeRepositoryOptions(...options)
    const [entities] = await this.db.get(this.getUserKey(id))
    return toJSON(entities)
  }
  private db: Datastore
  private UserKind = 'user'
  private UserChatSessionKind = 'user-chat-session'
  private aclTag = newResourceTag(this.UserKind)

  constructor(db: Datastore) {
    this.db = db
  }

  async createChatSession(input: CreateUserChatSessionInput, ...options: RepositoryOperationOption<User>[]): Promise<UserChatSession> {
    const option = composeRepositoryOptions(...options)

    const [existsChatSession] = await this.db.runQuery(
      this.db
        .createQuery(this.UserChatSessionKind)
        .filter('provider', input.provider)
        .filter('providerId', input.providerId)
    )
    if (existsChatSession.length > 0) {
      throw new Error(`Cannot create chat session because ${input.provider}.${input.providerId} is exists`)
    }

    const k = this.getUserChatSessionKey(input)
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

  async findMany(...options: RepositoryOperationOption<User>[]): Promise<PaginationResult<User>> {
    const option = composeRepositoryOptions(...options)

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

  async remove(...options: RepositoryOperationOption<User>[]): Promise<number> {
    const option = composeRepositoryOptions(...options)
    const users = await this.findMany(...options, WithSystemOperation())
    const tx = this.db.transaction()
    await Promise.all(
      users.records.map(async user => {
        await this.db.delete(users.records.map(user => tx.getUserKey(user.id)))
      })
    )

    return users.records.length
  }

  public getUserChatSessionKey(chatsession: CreateUserChatSessionInput) {
    const userKey = this.getUserKey(chatsession.userId)
    return this.db.key([this.UserKind, userKey.id, this.UserChatSessionKind, chatsession.provider + ':' + chatsession.providerId])
  }
  public getUserKey(userId: string) {
    if (Number.isInteger(parseInt(userId))) {
      return this.db.key([this.UserKind, parseInt(userId)])
    } else {
      return this.db.key([this.UserKind, userId])
    }
  }

  async findOne(...options: RepositoryOperationOption<User>[]): Promise<User | undefined> {
    const option = composeRepositoryOptions(...options)
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
  async create(input: CreateUserInput, ...option: UserRepositoryOperationOption[]): Promise<User> {
    const options = composeRepositoryOptions(...option)

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
      })
    ])
    const [entities] = await this.db.get(key)
    return toJSON(entities)
  }
}
