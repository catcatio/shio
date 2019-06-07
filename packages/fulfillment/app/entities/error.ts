import { ValidationError } from 'joi'

export enum ErrorType {
  Auth,
  NotFound,
  Input,
  Internal
}

export class GlobalError extends Error {
  errorType: ErrorType
  detail: string =""
  constructor(errorType: ErrorType, message: string) {
    super(message)
    this.errorType = errorType
  }

  withDetail(detail: string) {
    this.detail = detail
    return this
  }

  toString() {
    return `Type: ${this.errorType} Message: ${this.message}`
  }
}

function newGlobalError(errorType: ErrorType, message: string): GlobalError 
function newGlobalError(errorType: ValidationError): GlobalError 
function newGlobalError(errorType, message: string = ''): GlobalError {
  if (typeof errorType === 'number') {
    return new GlobalError(errorType, message)
  } else {
    return new GlobalError(ErrorType.Input, errorType.message)
  }
}
export { newGlobalError }
