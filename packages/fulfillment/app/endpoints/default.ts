import { MessageIntent } from '@shio/foundation/entities/intent'
import { OutgoingMessage, IncomingMessage } from '@shio/foundation/entities'

export type NarrowUnion<T, N> = T extends { name: N } ? T : never

export type EndpointFuntion = ReturnType<typeof createEndpointFunction>
export function createEndpointFunction<IntentName extends MessageIntent['name']>(
  intentName: IntentName,
  handler: (message: IncomingMessage & { intent: NarrowUnion<MessageIntent, IntentName> }) => Promise<OutgoingMessage | void >
) {
  return async function(message: IncomingMessage): Promise<OutgoingMessage | void> {
    if (message.intent.name === intentName) {
      return handler(message as any)
    } else {
      throw new Error(`Invalid intent for endpoint, require (${intentName}) but receive (${message.intent.name})`)
    }
  }
}
