import { ValidationError } from 'joi'

export enum ErrorType {
  Auth = 'unauthorize',
  NotFound = 'notfound',
  Input = 'badinput',
  Internal = 'internal'
}

export class GlobalError extends Error {
  kind: '_GLOBERR'
  errorType: ErrorType
  detail: any[] = []
  constructor(errorType: ErrorType, message: string) {
    super(message)
    this.errorType = errorType
  }

  withDetail(detail: string) {
    this.detail.push(detail)
    return this
  }

  toString() {
    return `Type: ${this.errorType} Message: ${this.message}`
  }
}

function newGlobalError(errorType: ErrorType, message: string): GlobalError {
  return new GlobalError(errorType, message)
}

export function isGlobError(error: any): error is GlobalError {
  return error['errorType']
}

export function newValidateError(error: ValidationError) {
  const err =  newGlobalError(ErrorType.Input, error.name)
  err.detail = error.details
}

export { newGlobalError }
