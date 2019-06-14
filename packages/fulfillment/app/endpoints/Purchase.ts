import { endpointFn, EndpointFunctionAncestor } from './default'
import * as uuid from 'uuid/v4'
import { PurchaseItemEventMessageIntentKind, ReservePaymentMessage, AssetMetadataBookKind } from '@shio-bot/foundation/entities'

export const PurchaseItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(PurchaseItemEventMessageIntentKind, async message => {
    const { assetId } = message.intent.parameters

    const asset = await ancestor.merchandise.findAssetByIdOrThrow(assetId)
    // TODO: create
    const kind = asset.meta.kind
    if (kind === AssetMetadataBookKind) {
      const reservePaymentMessage: ReservePaymentMessage = {
        type: 'ReservePayment',
        provider: 'linepay',
        orderId: uuid(), // primary key of purchasing
        productName: asset.meta.title,
        productDescription: asset.meta.description,
        productImageUrl: 'https://static.reeeed.com/book/cjn66col600cw08027wemah6s/shareThumbnailImage-medium.jpg', // optional
        amount: 120, // unit price
        currency: 'THB',
        source: message.source
      }
      return reservePaymentMessage
    }

    return
  })
