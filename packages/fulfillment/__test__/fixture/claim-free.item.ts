import { ClaimFreeItemEventMessageIntent, ClaimFreeItemEventMessageIntentKind } from "@shio-bot/foundation/entities";
import { FixtureExpect, FixtureStep, FixtureContext, createIncomingMessageFromFixtureContext } from "./step";

export function claimFreeItem(getParam: (ctx: FixtureContext) => ClaimFreeItemEventMessageIntent['parameters'], expect: FixtureExpect = () => { }): FixtureStep {
  return (ctx: FixtureContext) => {
    const incomingMessage = createIncomingMessageFromFixtureContext(ctx, {
      name: ClaimFreeItemEventMessageIntentKind,
      parameters: {
        ...getParam(ctx)
      }
    })
    return {
      expect,
      incomingMessage,
    }
  }
}