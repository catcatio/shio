import { endpointFn, EndpointFunctionAncestor } from "./default";
import { WithOperationOwner } from "../repositories";
import { createOutgoingFromIncomingMessage, DescribeItemMessageIntentKind, DescribeItemMessageFulfillmentKind } from "@shio-bot/foundation/entities";

export const DescribeItemEndpoint = (ancestor: EndpointFunctionAncestor) => endpointFn(DescribeItemMessageIntentKind, async (m) => {

  const session = await ancestor.getSessionFromIncomingMessageOrThrow(m)
  const asset = await ancestor.inventory
    .getBookAsset(
      m.intent.parameters.id,
      WithOperationOwner(session.userId)
    )

  return createOutgoingFromIncomingMessage(m, [
    {
      name: DescribeItemMessageFulfillmentKind,
      parameters: {
        asset: asset.meta,
        id: asset.id
      }
    }
  ])

})