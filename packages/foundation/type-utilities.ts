export type UnPromise<T> = T extends Promise<infer U> ? U : T

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export function atoi(value: string) {
  const x = parseInt(value, 10)
  if (Number.isNaN(x)) {
    throw new Error(value + ' is not a number')
  }
  return x
}

export type CommonAttributes = {
  createdAt: Date
  createdBy: string
  updatedAt?: string
}

export type PartialCommonAttributes<T extends CommonAttributes> = Omit<T, keyof CommonAttributes> & Partial<CommonAttributes>

export type FunctionOption<T> = (option: T) => T
export function composeFunctionOptions<T>(initial: T, ...options: FunctionOption<T>[]) {
  return options.reduce((current, next) => {
    return next(current)
  }, initial)
}
