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
import { FlexMessageBuilder, FlexComponentBuilder } from '@shio-bot/chatengine/line/helpers/lineMessageBuilder'
import { FlexImage, Message } from '@line/bot-sdk'
import { createReceiptFlexMessage } from './messageBuilder'

export class LineFulfillmentParser implements MessageFulfillmentParserList<Message> {
  private options: LineFulfillmentParserOption
  constructor(options: LineFulfillmentParserOption) {
    this.options = options
  }

  [ListItemEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof ListItemEventMessageFulfillmentKind> = (f: ListItemEventMessageFulfillment) => {
    const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()
    let template = lineTemplate.flexMessage(`book shelf`).addCarousel()

    f.parameters.assets.forEach(asset => {
      if (asset.meta.kind === AssetMetadataBookKind) {
        const bookMetadata = asset.meta

        const createHeroBlock = () =>
          FlexComponentBuilder.flexImage()
            .setUrl(bookMetadata.coverImageURL)
            .setSize('full')
            .setAspectRatio('20:13')
            .setAspectMode('cover')
            .build() as FlexImage

        const createBodyTitleBlock = () =>
          FlexComponentBuilder.flexBox()
            .setLayout('vertical')
            .addContents(
              FlexComponentBuilder.flexText()
                .setText(bookMetadata.title)
                .setWrap(true)
                .setWeight('bold')
                .build(),
              FlexComponentBuilder.flexText()
                .setText(bookMetadata.description)
                .setWrap(true)
                .build()
            )
            .build()

        const createBodyPriceBlock = () =>
          FlexComponentBuilder.flexBox()
            .setLayout('baseline')
            .setMargin('xxl')
            .setSpacing('sm')
            .addContents(
              FlexComponentBuilder.flexText()
                .setText('Price')
                .setFlex(1)
                .build(),
              FlexComponentBuilder.flexText()
                .setText(asset.price ? `${asset.price} THB` : 'FREE') //asset.price ? '120 THB' : 'FREE'
                .setWrap(true)
                .setColor('#666666')
                .setWeight('bold')
                .setFlex(5)
                .setAlign('end')
                .build()
            )
            .build()

        const createFooterBlock = options => {
          const purchaseIntent: PurchaseItemEventMessageIntent = {
            name: PurchaseItemEventMessageIntentKind,
            parameters: {
              assetId: asset.id
            }
          }

          let actionButton = FlexComponentBuilder.flexButton().setStyle('primary')
          if (asset.isOwnByOperationOwner) {
            actionButton = actionButton
              .setAction({
                type: 'uri',
                label: 'Open',
                uri: options.setting.liff.viewAsset + '?assetId=' + asset.id
              })
              .setColor('#47B881')
          } else if (asset.price) {
            actionButton = actionButton
              .setAction({
                type: 'postback',
                data: JSON.stringify(purchaseIntent),
                label: 'BUY'
              })
              .setColor('#1070CA')
          } else if (!asset.price) {
            actionButton = actionButton
              .setAction({
                type: 'postback',
                data: JSON.stringify(purchaseIntent),
                label: 'Get for free'
              })
              .setColor('#007489')
          }

          return FlexComponentBuilder.flexBox()
            .setLayout('vertical')
            .addContents(actionButton.build())
            .build()
        }

        template = template
          .addBubble()
          .addHero(createHeroBlock())
          .addBody()
          .setLayout('vertical')
          .addComponents(createBodyTitleBlock(), createBodyPriceBlock())
          .addFooter()
          .addComponents(createFooterBlock(this.options))
      }
    })
    return template.build()
  };

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
