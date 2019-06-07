import { SYSTEM_USER } from '../entities'
import { SchemaLike } from 'joi'
import { Datastore, Query } from '@google-cloud/datastore'
import { ErrorType, newGlobalError } from '../entities/error'

export class DatastoreBaseRepository {
  db: Datastore
  constructor(db: Datastore) {
    this.db = db
  }

  /**
   *
   * ### Allocate key from datastore
   * you can optional provide ID/Name
   * if latest index is kind
   * datastore will auto assign ID to key
   * #### example
   * `allocateKey(['book',4912800129, 'episode'])` << auto ID generate
   * `allocateKey(['book', 491828392,'episode', 'episode-a'])` << use Name as ID
   */
  async allocateKey(...paths: (string | number)[]) {
    let ids = await this.db.allocateIds(this.db.key([...paths]), 1)
    if (ids[0] < 1) {
      throw newGlobalError(ErrorType.Internal, 'ID allocation error, please try again')
    }
    const key = ids[0][0]
    return key
  }

  parseIdToDatastoreId(value: string): string | number {
    if (Number.isInteger(parseInt(value))) {
      return parseInt(value)
    } else {
      return value
    }
  }

  async runQuery(query: Query) {
    const [entities] = await this.db.runQuery(query)
    return entities
  }
}

export type JoiObjectSchema<T> = { [P in keyof T]-?: SchemaLike }

export type WhereOperator<T> = Partial<{
  Equal: string | number | Partial<T> | null
  NotEqual: string | number | T | null
  GreaterThan: string | number
  LessThan: string | number
}>
export type WhereConditions<T> = { [P in keyof T]?: WhereOperator<T[P]> }

export type RepositoryOptions<T = any> = {
  key?: string
  operationOwnerId: string
  requestId?: string
  where: WhereConditions<Partial<T>>[]
  limit: number
  offset: number
}

export type RepositoryOperationOption<T> = (option: RepositoryOptions<T>) => RepositoryOptions<T>

export function composeRepositoryOptions<T>(...opt: RepositoryOperationOption<T>[]) {
  return opt.reduce<RepositoryOptions<T>>(
    (options, opt) => {
      return opt(options)
    },
    {
      limit: 10,
      offset: 0,
      operationOwnerId: '<NONE>',
      where: []
    }
  )
}

export function WithWhere<T>(condition: WhereConditions<Partial<T>>): RepositoryOperationOption<T> {
  return function(opts) {
    opts.where.push(condition)
    return opts
  }
}

export function WithSystemOperation<T>(): RepositoryOperationOption<T> {
  return function(opts) {
    opts.operationOwnerId = SYSTEM_USER
    return opts
  }
}

export function WithKey(id: string): RepositoryOperationOption<any> {
  return function(opts) {
    opts.key = id
    return opts
  }
}

export function WithPagination<T = any>(limit: number = 5, offset: number = 10): RepositoryOperationOption<T> {
  return function(opts) {
    opts.limit = limit
    opts.offset = offset
    return opts
  }
}
export function WithOperationOwner<T>(userId: string): RepositoryOperationOption<T> {
  return function(opts) {
    opts.operationOwnerId = userId
    return opts
  }
}
