import { PurchaseItemEventMessageIntent } from "@shio-bot/foundation/entities";
import { FixtureExpect, FixtureStep, FixtureContext, createIncomingMessageFromFixtureContext } from "./step";
import { randomPurchaseItemIntent } from "@shio-bot/foundation/entities/__test__/random";

export function purchaseItem(params: PurchaseItemEventMessageIntent['parameters'], expect: FixtureExpect = () => { }): FixtureStep {
  return (ctx: FixtureContext) => {
    const intent = randomPurchaseItemIntent()
    intent.parameters = params
    const incomingMessage = createIncomingMessageFromFixtureContext(ctx, intent)
    return {
      expect,
      incomingMessage,
    }
  }
}