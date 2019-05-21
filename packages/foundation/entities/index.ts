export * from './message'

export interface PaginationResult<T> {
  limit: number
  offset: number
  total?: number
  records: T[]
}