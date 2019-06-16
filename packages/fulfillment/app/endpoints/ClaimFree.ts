import { EndpointFunctionAncestor, endpointFn } from './default'
import { ClaimFreeItemEventMessageIntentKind, createOutgoingFromIncomingMessage, ClaimFreeItemEventMessageFulfillmentKind, ClaimFreeItemEventMessageFulfillment, AssetMetadataBookKind } from '@shio-bot/foundation/entities'
import { WithOperationOwner } from '../repositories';

export const ClaimFreeItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(ClaimFreeItemEventMessageIntentKind, async message => {
    const { orderId } = message.intent.parameters

    const user = await ancestor.getSessionFromIncomingMessageOrThrow(message)
    const result = await ancestor.merchandise.commitPurchaseItem(orderId, 'free', 0, WithOperationOwner(user.id))

    const fulfilmentParams: ClaimFreeItemEventMessageFulfillment['parameters'] = {
      assetId: orderId,
      productName: result.assetMeta.title,
    }

    if (result.assetMeta.kind === AssetMetadataBookKind) {
      fulfilmentParams.productImageUrl = result.assetMeta.coverImageURL
      fulfilmentParams.productDescription = result.assetMeta.description
    }

    return createOutgoingFromIncomingMessage(message, [
      {
        name: ClaimFreeItemEventMessageFulfillmentKind,
        parameters: fulfilmentParams
      }
    ])
  })
