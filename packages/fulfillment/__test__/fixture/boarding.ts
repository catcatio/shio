import { FixtureStep, FixtureExpect, FixtureContext } from "./step";
import { randomIncomingMessage, randomFollowMessageIntent } from "@shio-bot/foundation/entities/__test__/random";
import { FollowEventMessageIntent } from "../../app/entities/asset";

export function follow(parameters: FollowEventMessageIntent['parameters'],expect: FixtureExpect = () => {}): FixtureStep {
  return (ctx: FixtureContext) => {
    const intent = randomFollowMessageIntent()
    intent.parameters = parameters
    const incomingMessage = randomIncomingMessage(intent)
    incomingMessage.provider = ctx.provider
    incomingMessage.source = {
      userId: ctx.userId,
      type: 'user',
    }
    return {
      expect,
      incomingMessage,
    }
  }
}