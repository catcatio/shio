import { endpointFn, EndpointFunctionAncestor } from './default'
import * as uuid from 'uuid/v4'
import { PurchaseItemEventMessageIntentKind, ReservePaymentMessage, AssetMetadataBookKind, createOutgoingFromIncomingMessage, ClaimFreeItemEventMessageFulfillmentKind } from '@shio-bot/foundation/entities'
import { WithOperationOwner, WithIncomingMessage } from '../repositories';

/**
 * ## PurchaseItemEventMessageIntentEndpoint
 * Intent สำหรับยืนยันการซื้อสินค้า (asset)
 * โดยเมื่อกด Purchese จะมีการสร้าง transaction ขึ้นมา
 * เพื่อรอ confirm payment จาก confirm payment channel
 * โดยแบ่งออกเป็น 2 scenario
 * - Free item
 * - Price item
 */
export const PurchaseItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(PurchaseItemEventMessageIntentKind, async message => {
    const { assetId } = message.intent.parameters
    const user = await ancestor.getSessionFromIncomingMessageOrThrow(message)
    await ancestor.merchandise.requestPurchaseItem(
      assetId,
      WithOperationOwner(user.id),
      WithIncomingMessage(message),
    )

    return createOutgoingFromIncomingMessage(message, [ ])

  })
