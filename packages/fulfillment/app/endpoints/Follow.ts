
import { endpointFn, EndpointFunctionAncestor } from "./default";
import { FollowEventMessageIntentKind, createOutgoingFromIncomingMessage, FollowEventMessageFulfillmentKind } from "@shio-bot/foundation/entities";
import { WithSystemOperation, WithIncomingMessage } from "../repositories";
import { GlobalError } from "../entities/error";
import { UsecaseErrorMessages } from "../usecases";

export const FollowEventMessageIntentEndpoint = (ctx: EndpointFunctionAncestor) => endpointFn(FollowEventMessageIntentKind, async (message) => {
  try {
    const output = await ctx.boarding.userFollow(
      {
        displayName: message.intent.parameters.displayName,
        provider: message.provider,
        providerId: message.source.userId
      },
      WithSystemOperation(),
      WithIncomingMessage(message)
    )

    return createOutgoingFromIncomingMessage(message, [
      {
        name: FollowEventMessageFulfillmentKind,
        parameters: {
          chatSessionId: output.userChatSession.id,
          userId: output.user.id,
          isCompleted: true,
          isExists: false,
        }
      }
    ])
  } catch (e) {
    if (e instanceof GlobalError) {
      return createOutgoingFromIncomingMessage(message, [
        {
          name: FollowEventMessageFulfillmentKind,
          parameters: {
            isCompleted: false,
            isExists: e.message === UsecaseErrorMessages.USER_ALREADY_EXISTED,
            description: e.toString()
          }
        }
      ])
    } else {
      throw e
    }
  }

})