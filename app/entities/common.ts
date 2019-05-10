export interface PaginationResult<T> {
  limit: number
  offset: number
  total: number
  records: T[]
}

export type UnPromise<T> =
    T extends Promise<infer U> ? U :
    T

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>