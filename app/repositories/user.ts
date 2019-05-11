import { User } from '../entities/user'
import { RepositoryOperationOption, JoiObjectSchema, composeRepositoryOptions, WithWhere, WithSystemOperation } from './common'
import { Omit } from '../entities/common'
import { Datastore } from '@google-cloud/datastore'
import * as Joi from 'joi'
import { newGlobalError, ErrorType } from '../entities/error'
import { newResourceTag, Permission } from '../entities'
import { ACLRepository, DatastoreACLRepository } from './acl'
import { applyFilter } from './database/filter'
import { toJSON } from './database/toJSON'

export type UserRepositoryOperationOption = RepositoryOperationOption<User>

export type CreateUserInput = Omit<User, 'id' | 'aclTag'>
const CreateUserInputSchema: JoiObjectSchema<CreateUserInput> = {
  displayName: Joi.string(),
  providers: Joi.object(),
  stellarEncryptedSecretKey: Joi.string(),
  stellarPublicKey: Joi.string()
}
const JoiCreateUserInput = Joi.object().keys(CreateUserInputSchema)
export interface UserRepository {
  CreateUser(input: CreateUserInput, ...options: UserRepositoryOperationOption[]): Promise<User>
  FindOneUser(...options: UserRepositoryOperationOption[]): Promise<User | undefined>
  FindManyUser(...options: UserRepositoryOperationOption[]): Promise<User[]>
  RemoveUser(...options: UserRepositoryOperationOption[]): Promise<number>
}

export class DatastoreUserRepository implements UserRepository {
  async FindManyUser(...options: RepositoryOperationOption<User>[]): Promise<User[]> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind), Permission.VIEWER)
    let query = applyFilter(this.db.createQuery(this.UserKind), option)
      .limit(option.limit)
      .offset(option.offset)
    const [entities] = await this.db.runQuery(query)
    return entities.map(e => toJSON(e))
  }

  async RemoveUser(...options: RepositoryOperationOption<User>[]): Promise<number> {
    const option = composeRepositoryOptions(...options)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag(this.UserKind), Permission.OWNER)
    const users = await this.FindManyUser(...options, WithSystemOperation())
    await this.db.delete(users.map(user => this.getKey(user.id)))
    return users.length
  }
  private db: Datastore
  private acl: ACLRepository
  private UserKind = 'user'

  private getTag(userId: string) {
    return newResourceTag(this.UserKind, userId)
  }
  private getKey(userId: string) {
    if (Number.isInteger(parseInt(userId))) {
      return this.db.key([this.UserKind, parseInt(userId)])
    } else {
      return this.db.key([this.UserKind, userId])
    }
  }

  constructor(db: Datastore)
  constructor(db: Datastore, acl?: ACLRepository) {
    this.db = db
    if (acl) {
      this.acl = acl
    } else {
      this.acl = new DatastoreACLRepository(db)
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
  async CreateUser(input: CreateUserInput, ...option: UserRepositoryOperationOption[]): Promise<User> {
    const options = composeRepositoryOptions(...option)
    await this.acl.IsGrantedOrThrow(options.operationOwnerId, this.getTag('*'), Permission.WRITER)

    const { error, value } = JoiCreateUserInput.validate(input)
    if (error) {
      throw newGlobalError(error)
    }

    if (input.providers.lineId) {
      const existsLineId = await this.FindOneUser(
        WithWhere<User>({
          providers: {
            Equal: {
              lineId: input.providers.lineId
            }
          }
        }),
        WithSystemOperation()
      )
      if (existsLineId) {
        throw newGlobalError(ErrorType.Input, 'Line ID is already bind with another account')
      }
    }

    const ids = await this.db.allocateIds(this.db.key([this.UserKind]), 1)
    const key = ids[0][0]
    await this.db.upsert({
      key: key,
      data: {
        ...value,
        aclTag: newResourceTag('user', key.id).toString()
      }
    })
    return {
      id: '',
      aclTag: '',
      ...input
    }
  }
}
