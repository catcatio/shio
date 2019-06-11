import { MessageIntent } from '@shio-bot/foundation/entities/intent'
import { OutgoingMessage, IncomingMessage, ReservePaymentMessage } from '@shio-bot/foundation/entities'
import { MerchandiseUseCase, BoardingUsecase } from '../usecases';
import { UserChatSession } from '../entities';
import { InventoryUseCase } from '../usecases/inventory';

export type NarrowUnion<T, N> = T extends { name: N } ? T : never

export type EndpointFuntion = ReturnType<typeof endpointFn>
export function endpointFn<IntentName extends MessageIntent['name']>(
  intentName: IntentName,
  handler: (message: IncomingMessage & { intent: NarrowUnion<MessageIntent, IntentName> }) => Promise<OutgoingMessage | ReservePaymentMessage | void>
) {
  return async (message: IncomingMessage): Promise<OutgoingMessage | ReservePaymentMessage | void> => {
    if (message.intent.name === intentName) {
      return handler(message as any)
    } else {
      throw new Error(`Invalid intent for endpoint, require (${intentName}) but receive (${message.intent.name})`)
    }
  }
}

export interface EndpointFunctionAncestor {
  boarding: BoardingUsecase
  merchandise: MerchandiseUseCase
  inventory: InventoryUseCase

  getSessionFromIncomingMessageOrThrow(incomingMessage: IncomingMessage): Promise<UserChatSession>
  getSessionFromIncomingMessage(incomingMessage: IncomingMessage)
}