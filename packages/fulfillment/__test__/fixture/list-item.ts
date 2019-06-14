import { ListItemEventMessageIntent } from "@shio-bot/foundation/entities";
import { FixtureExpect, FixtureStep, FixtureContext, createIncomingMessageFromFixtureContext } from "./step";
import { randomListItemEventMessageIntent } from "@shio-bot/foundation/entities/__test__/random";

export function listItem(params: ListItemEventMessageIntent['parameters'], expect: FixtureExpect = () => { }): FixtureStep {
  return (ctx: FixtureContext) => {
    const intent = randomListItemEventMessageIntent()
    intent.parameters = params
    const incomingMessage = createIncomingMessageFromFixtureContext(ctx, intent)
    return {
      expect,
      incomingMessage,
    }
  }
}