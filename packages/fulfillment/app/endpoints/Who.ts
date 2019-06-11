import { EndpointFunctionAncestor, endpointFn } from "./default";
import { WhoMessageIntentKind, createOutgoingFromIncomingMessage, WhoMessageFulfilmentKind } from "../entities/asset";



export const WhoMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) => {
  return endpointFn(WhoMessageIntentKind, async (m) => {
    const session = await ancestor.getSessionFromIncomingMessageOrThrow(m)

    return createOutgoingFromIncomingMessage(m, [
      {
        name: WhoMessageFulfilmentKind,
        parameters: {
          ...session,
        }
      }
    ])
  })

}