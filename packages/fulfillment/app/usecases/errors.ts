import { MessageProvider } from "@shio-bot/foundation/entities";
import { GlobalError, ErrorType } from "../entities/error";


export const UsecaseErrorMessages = {
  USER_ALREADY_EXISTED: 'create user error, user already exists'
}

export const createUserError = (provider: MessageProvider, providerId: string) => {
  return new GlobalError(ErrorType.Input, UsecaseErrorMessages.USER_ALREADY_EXISTED).withDetail(`${provider}: ${providerId}`)
}