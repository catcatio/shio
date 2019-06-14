import { endpointFn, EndpointFunctionAncestor } from "./default";
import { GetItemDownloadUrlEventMessageIntentKind, createOutgoingFromIncomingMessage, GetItemDownloadUrlEventMessageFulfillmentKind } from "@shio-bot/foundation/entities";
import { WithOperationOwner } from "../repositories";

export const GetItemDownloadUrlEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) => endpointFn(GetItemDownloadUrlEventMessageIntentKind, async m => {

  const user = await ancestor.getSessionFromIncomingMessageOrThrow(m)
  const output = await ancestor.inventory.getAssetDownloadableUrl(m.intent.parameters.assetId, 'application/pdf', WithOperationOwner(user.id))
  if (output) {
    return createOutgoingFromIncomingMessage(m, [
      {
        name: GetItemDownloadUrlEventMessageFulfillmentKind,
        paramters: {
          url: output
        }
      }
    ])
  }

})