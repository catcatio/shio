import { EndpointFunctionAncestor, endpointFn } from './default'
import {
  ClaimFreeItemEventMessageIntentKind,
  createOutgoingFromIncomingMessage,
  ClaimFreeItemEventMessageFulfillmentKind,
  ClaimFreeItemEventMessageFulfillment,
  AssetMetadataBookKind
} from '@shio-bot/foundation/entities'
import { WithOperationOwner, WithIncomingMessage } from '../repositories'

export const ClaimFreeItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(ClaimFreeItemEventMessageIntentKind, async message => {
    const { orderId } = message.intent.parameters

    const session = await ancestor.getSessionFromIncomingMessageOrThrow(message)
    const result = await ancestor.merchandise.commitPurchaseItem(orderId, 'free', 0, WithIncomingMessage(message), WithOperationOwner(session.userId))

    const fulfilmentParams: ClaimFreeItemEventMessageFulfillment['parameters'] = {
      orderId,
      assetId: result.assetId,
      productName: result.assetMeta.title
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
