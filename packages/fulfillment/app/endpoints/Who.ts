import { EndpointFunctionAncestor, endpointFn } from "./default";
import { WhoMessageIntentKind, createOutgoingFromIncomingMessage, WhoMessageFulfilmentKind } from "../entities/asset";
import { newLogger } from "@shio-bot/foundation";
import { WithOperationOwner, WithIncomingMessage } from "../repositories";



export const WhoMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) => {
  return endpointFn(WhoMessageIntentKind, async (m) => {
    let log = newLogger().withRequestId(m.requestId)
      .withProviderName(m.provider)
    log.info("request intent who")
    const session = await ancestor.getSessionFromIncomingMessageOrThrow(m)
    log = log.withUserId(session.userId)
    const user = await ancestor.boarding.getUserProfileOrThrow(
      session.provider, session.providerId,
      WithOperationOwner(session.userId),
      WithIncomingMessage(m),
    )
    log.info('done')
    return createOutgoingFromIncomingMessage(m, [
      {
        name: WhoMessageFulfilmentKind,
        parameters: {
          ...session,
          ...user,
        }
      }
    ])
  })

}