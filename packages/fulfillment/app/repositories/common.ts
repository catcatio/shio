import { SYSTEM_USER } from '../entities'
import { SchemaLike } from 'joi'
import { Datastore, Query, DatastoreRequest, Transaction } from '@google-cloud/datastore'
import { ErrorType, newGlobalError } from '../entities/error'
import { logger, ShioLogger, newLogger } from '@shio-bot/foundation'
import { MessageProvider, IncomingMessage } from '@shio-bot/foundation/entities'
import { entity } from '@google-cloud/datastore/build/src/entity'

export interface Transactionalable<T> {
  begin(): Promise<T>
  commit(): Promise<void>
  rollback(): Promise<void>
}

export class DatastoreBaseRepository<Transactional extends DatastoreBaseRepository = any> {
  db: DatastoreRequest

  begin(): Promise<Transactional> {
    throw new Error('transactional begin function is not implemented')
  }

  private isTransactional(db: DatastoreRequest): db is Transaction {
    if (typeof db.commit === 'function') {
      return true
    }
    return false
  }
  async commit() {
    const tx = this.db
    if (this.isTransactional(tx)) {
      await tx.commit()
      return
    }
    throw new Error('commit invalid transaction....')
  }
  async rollback() {
    const tx = this.db
    if (this.isTransactional(tx)) {
      await tx.rollback()
      return
    }
    throw new Error('commit invalid transaction....')
  }

  constructor(db: DatastoreRequest) {
    if (this.isTransactional(db)) {
      console.log('use transactional mode in datastore...')
    }
    this.db = db
  }

  /**
   *
   * ### Allocate key from datastore
   * you can optional provide ID/Name
   * if latest index is kind
   * datastore will auto assign ID to key
   * #### example
   * `allocateKey(['book', 4912800129, 'episode'])` << auto ID generate
   * `allocateKey(['book', 491828392, 'episode', 'episode-a'])` << use Name as ID
   */
  async allocateKey(...paths: (string | number)[]) {
    let ids = await this.db.allocateIds(this.db.key([...paths.map(this.parseIdToDatastoreId)]), 1)
    if (ids[0] < 1) {
      throw newGlobalError(ErrorType.Internal, 'ID allocation error, please try again')
    }
    const key = ids[0][0]
    return key
  }

  key(...path: (string | number)[]) {
    if (this.db.datastore) {
      return this.db.datastore.key(path.map(this.parseIdToDatastoreId))
    }
    return this.db.key(path.map(this.parseIdToDatastoreId))
  }

  parseIdToDatastoreId(value: string | number): string | number {
    if (Number.isInteger(+value)) {
      return parseInt(value + "")
    } else {
      return value
    }
  }

  getIdFromKey(key: entity.Key): { kind: string; id: string } {
    if (key.id) {
      return {
        kind: key.kind,
        id: key.id
      }
    } else if (key.name) {
      return {
        kind: key.kind,
        id: key.name
      }
    } else {
      throw newGlobalError(ErrorType.Input, 'invalid key....')
    }
  }

  async runQuery(query: Query) {
    const [entities] = await this.db.runQuery(query)
    return entities
  }

  async getByKey(key: entity.Key) {
    const [entities] = await this.db.get(key)
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

export class OperationOptions<T = any> {
  key?: string
  operationOwnerId: string = '<none>'
  provider?: MessageProvider
  requestId?: string
  where: Array<WhereConditions<Partial<T>>> = []
  limit: number = 10
  offset: number = 0
  // logger: ShioLogger
  get logger(): ShioLogger {
    let log = newLogger()
    if (this.requestId) {
      log = log.withRequestId(this.requestId)
    }
    if (this.operationOwnerId) {
      log = log.withUserId(this.operationOwnerId)
    }
    if (this.provider) {
      log = log.withProviderName(this.provider)
    }
    return log
  }
}

export type OperationOption<T = any> = (option: OperationOptions<T>) => OperationOptions<T>

export function composeOperationOptions<T>(...opt: OperationOption<T>[]) {
  const option = new OperationOptions()
  return opt.reduce<OperationOptions<T>>((options, opt) => {
    return opt(options)
  }, option)
}

export function WithWhere<T>(condition: WhereConditions<Partial<T>>): OperationOption<T> {
  return function (opts) {
    opts.where.push(condition)
    return opts
  }
}

export function WithSystemOperation<T>(): OperationOption<T> {
  return function (opts) {
    opts.operationOwnerId = SYSTEM_USER
    return opts
  }
}

export function WithKey(id: string): OperationOption<any> {
  return function (opts) {
    opts.key = id
    return opts
  }
}

// config operation attribute with incoming message object
export function WithIncomingMessage(msg: IncomingMessage): OperationOption<any> {
  return function (opts) {
    opts.provider = msg.provider
    opts.requestId = msg.requestId
    return opts
  }
}

export function WithPagination<T = any>(limit: number = 5, offset: number = 10): OperationOption<T> {
  return function (opts) {
    opts.limit = limit
    opts.offset = offset
    return opts
  }
}
export function WithOperationOwner<T>(userId: string): OperationOption<T> {
  return function (opts) {
    opts.operationOwnerId = userId
    return opts
  }
}
