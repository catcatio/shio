import { MessageFulfillmentParserList, FulfillmentparserFunc, LineFulfillmentParserOption } from '../../types'
import {
  ListItemEventMessageFulfillmentKind,
  FollowEventMessageFulfillmentKind,
  ErrorEventMessageFulfillmentKind,
  WhoMessageFulfilmentKind,
  GetItemDownloadUrlEventMessageFulfillmentKind,
  AssetMetadataBookKind,
  UnfollowEventMessageIntentKind,
  ListItemEventMessageFulfillment,
  FollowEventMessageFulfillment,
  ErrorEventMessageFulfillment,
  WhoMessageFulfillment,
  GetItemDownloadUrlEventMessageFulfillment,
  PurchaseItemEventMessageIntentKind,
  PurchaseItemEventMessageIntent,
  ClaimFreeItemEventMessageFulfillmentKind,
  ClaimFreeItemEventMessageFulfillment,
  DescribeItemMessageFulfillmentKind,
  DescribeItemMessageFulfillment
} from '@shio-bot/foundation/entities'
import { Message } from '@line/bot-sdk'
import { createReceiptFlexMessage, createListAssetFlexMessage } from './messageBuilder'

export class LineFulfillmentParser implements MessageFulfillmentParserList<Message> {
  private options: LineFulfillmentParserOption
  constructor(options: LineFulfillmentParserOption) {
    this.options = options
  }

  [ListItemEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof ListItemEventMessageFulfillmentKind> = (f: ListItemEventMessageFulfillment) =>
    createListAssetFlexMessage(f.parameters.assets, this.options.setting.liff.viewAsset);

  [FollowEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof FollowEventMessageFulfillmentKind> = (f: FollowEventMessageFulfillment) => {
    return {
      type: 'text',
      text: f.parameters.isExists ? 'Welcome back!!!~' : 'Welcome to Catcat!!!~'
    }
  };

  [UnfollowEventMessageIntentKind]: FulfillmentparserFunc<Message, typeof UnfollowEventMessageIntentKind> = f => {
    return {
      type: 'text',
      text: 'Unfollow'
    }
  };

  [ErrorEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof ErrorEventMessageFulfillmentKind> = (f: ErrorEventMessageFulfillment) => {
    return {
      type: 'text',
      text: 'I do not understand, please type again'
    }
  };

  [WhoMessageFulfilmentKind]: FulfillmentparserFunc<Message, typeof WhoMessageFulfilmentKind> = (f: WhoMessageFulfillment) => {
    return {
      type: 'text',
      text: JSON.stringify(f.parameters)
    }
  };

  [GetItemDownloadUrlEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof GetItemDownloadUrlEventMessageFulfillmentKind> = (
    f: GetItemDownloadUrlEventMessageFulfillment
  ) => {
    return {
      type: 'text',
      text: 'Get item download url'
    }
  };

  [ClaimFreeItemEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof ClaimFreeItemEventMessageFulfillmentKind> = (f: ClaimFreeItemEventMessageFulfillment) => {
    const { productDescription, productImageUrl, productName, orderId } = f.parameters
    return createReceiptFlexMessage({
      totalPrice: 0,
      currency: 'THB',
      transactionId: '', // TODO
      orderId: orderId, // TODO
      product: {
        name: productName,
        description: productDescription,
        price: 0,
        imageUrl: productImageUrl || ''
      }
    })
  };

  [DescribeItemMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof DescribeItemMessageFulfillmentKind> = (f: DescribeItemMessageFulfillment) => {
    return {
      type: 'text',
      text: 'describe-item'
    }
  }
}
