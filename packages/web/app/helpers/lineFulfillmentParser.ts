import { MessageFulfillmentParser, FulfillmentparserFunc } from '../types'
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
import { FlexMessageBuilder, FlexComponentBuilder } from './lineMessageBuilder'
import { FlexImage, Message } from '@line/bot-sdk'

export class LineFulfillmentParser implements MessageFulfillmentParser<Message> {
  [ListItemEventMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof ListItemEventMessageFulfillmentKind> = (f: ListItemEventMessageFulfillment) => {
    const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()
    const template = lineTemplate.flexMessage(`book shelf`).addCarousel()

    f.parameters.assets.forEach(asset => {
      switch (asset.meta.kind) {
        case AssetMetadataBookKind: {
          const heroBlock = FlexComponentBuilder.flexImage()
            .setUrl('https://static.reeeed.com/book/cjn66col600cw08027wemah6s/shareThumbnailImage-small.jpg' || asset.meta.coverImageURL)
            .setSize('full')
            .setAspectRatio('20:13')
            .setAspectMode('cover')
            .build() as FlexImage

          const bodyTitleBlock = FlexComponentBuilder.flexBox()
            .setLayout('vertical')
            .addContents(
              FlexComponentBuilder.flexText()
                .setText(asset.meta.title)
                .setWrap(true)
                .setWeight('bold')
                .build(),
              FlexComponentBuilder.flexText()
                .setText(asset.meta.description)
                .setWrap(true)
                .build()
            )
            .build()

          const bodyPriceBlock = FlexComponentBuilder.flexBox()
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

          const purchaseIntent: PurchaseItemEventMessageIntent = {
            name: PurchaseItemEventMessageIntentKind,
            parameters: {
              assetId: asset.id
            }
          }
          const footerBlock = FlexComponentBuilder.flexBox()
            .setLayout('vertical')
            .addContents(
              FlexComponentBuilder.flexButton()
                .setStyle('primary')
                .setColor('#718792')
                .setAction({
                  type: 'postback',
                  data: JSON.stringify(purchaseIntent),
                  label: asset.price ? 'BUY' : 'FREE' //asset.price ? 'BUY' : 'FREE'
                })
                .build()
            )
            .build()

          template
            .addBubble()
            .addHero(heroBlock)
            .addBody()
            .setLayout('vertical')
            .addComponents(bodyTitleBlock, bodyPriceBlock)
            .addFooter()
            .addComponents(footerBlock)
        }
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
    const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()

    const createItem = (name: string, price: string, imageUrl?: string) => {
      const box = FlexComponentBuilder.flexBox().setLayout('horizontal')
      if (imageUrl) {
        box.addContents(
          FlexComponentBuilder.flexImage()
            .setUrl(imageUrl || '')
            .setSize('xs')
            .setAspectRatio('4:3')
            .setAspectMode('cover')
            .setFlex(1)
            .build()
        )
      }

      return box
        .addContents(
          FlexComponentBuilder.flexText()
            .setText(name)
            .setSize('sm')
            .setColor('#555555')
            .setWrap(true)
            .setFlex(1)
            .build(),
          FlexComponentBuilder.flexText()
            .setText(price)
            .setSize('sm')
            .setColor('#111111')
            .setFlex(1)
            .setAlign('end')
            .build()
        )
        .build()
    }

    const headerBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .addContents(
        FlexComponentBuilder.flexText()
          .setText('RECEIPT')
          .setWeight('bold')
          .setSize('sm')
          .setColor('#1db446')
          .build(),
        FlexComponentBuilder.flexText()
          .setText('Cat Cat')
          .setWeight('bold')
          .setSize('xxl')
          .setMargin('md')
          .build()
      )
      .build()

    const bodyItemBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setMargin('xxl')
      .setSpacing('sm')
      .addContents(createItem(`${f.parameters.productName} ${f.parameters.productDescription}`, 'FREE', f.parameters.productImageUrl))
      .build()

    const bodySummaryBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setMargin('xxl')
      .setSpacing('sm')
      .addContents(createItem('TOTAL', 'FREE'))
      .build()

    const footerBlock = FlexComponentBuilder.flexBox()
      .setLayout('horizontal')
      .setMargin('md')
      .addContents(
        FlexComponentBuilder.flexText()
          .setText('TRANSACTION ID')
          .setSize('xs')
          .setColor('#aaaaaa')
          .setFlex(0)
          .build(),
        FlexComponentBuilder.flexText()
          .setText('1234567890')
          .setSize('xs')
          .setColor('#aaaaaa')
          .setAlign('end')
          .build()
      )
      .build()

    const separatorBlock = FlexComponentBuilder.flexSeparator()
      .setMargin('xxl')
      .build()

    return lineTemplate
      .flexMessage('purchased receipt')
      .addBubble()
      .addBody()
      .setLayout('vertical')
      .addComponents(headerBlock, separatorBlock, bodyItemBlock, separatorBlock, bodySummaryBlock, separatorBlock)
      .addFooter()
      .addComponents(footerBlock)
      .build()
  };

  [DescribeItemMessageFulfillmentKind]: FulfillmentparserFunc<Message, typeof DescribeItemMessageFulfillmentKind> = (f: DescribeItemMessageFulfillment) => {
    return {
      type: 'text',
      text: 'describe-item'
    }
  }
}
