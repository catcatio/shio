import { EndpointFunctionAncestor, endpointFn } from './default'
import { ClaimFreeItemEventMessageIntentKind, createOutgoingFromIncomingMessage, ClaimFreeItemEventMessageFulfillmentKind } from '@shio-bot/foundation/entities'

export const ClaimFreeItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(ClaimFreeItemEventMessageIntentKind, async message => {
    const { productName, productDescription, productImageUrl } = message.intent.parameters

    return createOutgoingFromIncomingMessage(message, [
      {
        name: ClaimFreeItemEventMessageFulfillmentKind,
        parameters: {
          productName,
          productDescription,
          productImageUrl: productImageUrl || 'https://static.reeeed.com/book/cjn66col600cw08027wemah6s/shareThumbnailImage-medium.jpg'
        }
      }
    ])
  })
