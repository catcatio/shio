import { endpointFn, EndpointFunctionAncestor } from "./default";
import { ListItemEventMessageIntentKind, createOutgoingFromIncomingMessage, ListItemEventMessageFulfillmentKind } from "@shio-bot/foundation/entities";
import { WithOperationOwner } from "../repositories";


export const ListItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) => endpointFn(ListItemEventMessageIntentKind, async (message) => {

  const session = await ancestor.getSessionFromIncomingMessageOrThrow(message)
  const { limit, offset } = message.intent.parameters
  const output = await ancestor.merchandise.listItem(
    {
      limit: message.intent.parameters.limit,
      offset: message.intent.parameters.offset,
    },
    WithOperationOwner(session.userId)
  )
  return createOutgoingFromIncomingMessage(message, [
    {
      name: ListItemEventMessageFulfillmentKind,
      parameters: {
        assets: output.records,
        hasNext: false,
        hasPrev: false,
        limit: limit || 10,
        offset: offset || 0,
        merchantTitle: "Reed",
      },
    }
  ])
})

