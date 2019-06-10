export * from './message'
export * from './payment'
export * from './intent'
export * from './asset'

export interface PaginationResult<T> {
  limit: number
  offset: number
  total?: number
  records: T[]
}
