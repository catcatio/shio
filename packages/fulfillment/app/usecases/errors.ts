import { MessageProvider } from "@shio/foundation/entities";
import { GlobalError, ErrorType } from "../entities/error";


const UsecaseErrorMessages = {
  CREATE_USER_ERROR: 'Create user error, user already exists'
}

export const createUserError = (provider: MessageProvider, providerId: string) => {
  return new GlobalError(ErrorType.Input, UsecaseErrorMessages.CREATE_USER_ERROR).withDetail(`${provider}: ${providerId}`)
}