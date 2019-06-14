import { MessageProviderParser, parserFunc } from '../types'
import {
  ListItemEventMessageFulfillmentKind,
  FollowEventMessageFulfillmentKind,
  ErrorEventMessageFulfillmentKind,
  WhoMessageFulfilmentKind,
  GetItemDownloadUrlEventMessageFulfillmentKind,
  AssetMetadataBookKind,
  UnfollowEventMessageIntentKind,
  PurchaseItemEventMessageIntentKind,
  ListItemEventMessageFulfillment,
  FollowEventMessageFulfillment,
  ErrorEventMessageFulfillment,
  WhoMessageFulfillment,
  GetItemDownloadUrlEventMessageFulfillment
} from '@shio-bot/foundation/entities'
import { FlexMessageBuilder, FlexComponentBuilder } from './lineMessageBuilder'
import { FlexImage, Message } from '@line/bot-sdk'

export class LineFulfillmentParser implements MessageProviderParser<Message> {
  [ListItemEventMessageFulfillmentKind]: parserFunc<Message, typeof ListItemEventMessageFulfillmentKind> = (f: ListItemEventMessageFulfillment) => {
    const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()
    const template = lineTemplate.flexMessage(`book shelf`).addCarousel()

    f.parameters.assets.forEach(asset => {
      switch (asset.meta.kind) {
        case AssetMetadataBookKind: {
          template
            .addBubble()
            .addHero(FlexComponentBuilder.flexImage()
              .setUrl('https://static.reeeed.com/book/cjn66col600cw08027wemah6s/shareThumbnailImage-small.jpg' || asset.meta.coverImageURL)
              .setSize('full')
              .setAspectRatio('20:13')
              .setAspectMode('cover')
              .build() as FlexImage)
            .addBody()
            .setLayout('vertical')
            .setSpacing('xs')
            .addComponents(
              FlexComponentBuilder.flexBox()
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
                    .build(),
                  FlexComponentBuilder.flexBox()
                    .setLayout('vertical')
                    .setMargin('md')
                    .setSpacing('sm')
                    .addContents(
                      FlexComponentBuilder.flexBox()
                        .setLayout('baseline')
                        .setSpacing('sm')
                        .addContents(
                          FlexComponentBuilder.flexText()
                            .setText('Price')
                            .setFlex(1)
                            .build(),
                          FlexComponentBuilder.flexText()
                            .setText('120 THB')
                            .setWrap(true)
                            .setColor('#666666')
                            .setFlex(5)
                            .build()
                        )
                        .build()
                    )
                    .build()
                )
                .build()
            )
            .addFooter()
            .setLayout('vertical')
            .addComponents(
              FlexComponentBuilder.flexBox()
                .setLayout('vertical')
                .addContents(
                  FlexComponentBuilder.flexButton()
                    .setStyle('primary')
                    .setColor('#718792')
                    .setAction({
                      type: 'message',
                      text: `BUY ${asset.meta.title} ${asset.meta.description}`,
                      label: 'BUY'
                    })
                    .build()
                )
                .build()
            )
        }
      }
    })
    return template.build()
  };

  [FollowEventMessageFulfillmentKind]: parserFunc<Message, typeof FollowEventMessageFulfillmentKind> = (f: FollowEventMessageFulfillment) => {
    return {
      type: 'text',
      text: f.parameters.isExists ? 'Welcome back!!!~' : 'Welcome to Catcat!!!~'
    }
  };

  [UnfollowEventMessageIntentKind]: parserFunc<Message, typeof UnfollowEventMessageIntentKind> = f => {
    return {
      type: 'text',
      text: 'Unfollow'
    }
  };

  [ErrorEventMessageFulfillmentKind]: parserFunc<Message, typeof ErrorEventMessageFulfillmentKind> = (f: ErrorEventMessageFulfillment) => {
    return {
      type: 'text',
      text: 'I do not understand, please type again'
    }
  };

  [WhoMessageFulfilmentKind]: parserFunc<Message, typeof WhoMessageFulfilmentKind> = (f: WhoMessageFulfillment) => {
    return {
      type: 'text',
      text: JSON.stringify(f.parameters)
    }
  };

  [GetItemDownloadUrlEventMessageFulfillmentKind]: parserFunc<Message, typeof GetItemDownloadUrlEventMessageFulfillmentKind> = (f: GetItemDownloadUrlEventMessageFulfillment) => {
    return {
      type: 'text',
      text: 'Get item download url'
    }
  }
}
