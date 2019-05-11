import { SYSTEM_USER } from '../entities'
import { SchemaLike } from 'joi'

export type JoiObjectSchema<T> = { [P in keyof T]-?: SchemaLike }

export type WhereOperator<T> = Partial<{
  Equal: string | number | T | null
  NotEqual: string | number | T | null
  GreaterThan: string | number
  LessThan: string | number
}>
export type WhereConditions<T> = { [P in keyof T]?: WhereOperator<T[P]> }

export type RepositoryOptions<T = any> = {
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

export function WithOperationOwner<T>(userId: string): RepositoryOperationOption<T> {
  return function(opts) {
    opts.operationOwnerId = userId
    return opts
  }
}
