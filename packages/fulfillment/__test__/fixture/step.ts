import { MessageProvider, IncomingMessage, OutgoingMessage, MessageIntent } from "@shio-bot/foundation/entities";
import { randomIncomingMessage } from "@shio-bot/foundation/entities/__test__/random";

export type FixtureContext = {
  provider: MessageProvider
  userId: string
  variables: { [key: string]: string }
}
export type FixtureExpect = (outgoingMesage: OutgoingMessage, ctx: FixtureContext) => void
export type FixtureStep = (ctx: FixtureContext) => {
  incomingMessage: IncomingMessage,
  expect: FixtureExpect
}

export function createIncomingMessageFromFixtureContext(ctx: FixtureContext, intent: MessageIntent): IncomingMessage {
  const r = randomIncomingMessage(intent)
  r.source = {
    userId: ctx.userId,
    type: 'user',
  }
  return r
}