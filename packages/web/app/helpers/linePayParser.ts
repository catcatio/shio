import { MessagePaymentParser, PaymentParserFunc } from '../types'
import {
  ReservePaymentResultMessageType,
  ReservePaymentResultMessage,
  ReservePaymentMessageType,
  ReservePaymentMessage,
  ConfirmPaymentResultMessageType,
  ConfirmPaymentResultMessage,
  ClaimFreeItemEventMessageIntent,
  ClaimFreeItemEventMessageIntentKind
} from '@shio-bot/foundation/entities'
import { Message, FlexImage } from '@line/bot-sdk'
import { FlexMessageBuilder, FlexComponentBuilder } from './lineMessageBuilder'

export class LinePayParser implements MessagePaymentParser<Message> {
  [ReservePaymentResultMessageType]: PaymentParserFunc<Message, typeof ReservePaymentResultMessageType> = (r: ReservePaymentResultMessage, rp: ReservePaymentMessage) => {
    const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()

    const heroBlock = FlexComponentBuilder.flexImage()
      .setUrl(rp.productImageUrl ? rp.productImageUrl : '')
      .setSize('full')
      .setAspectRatio('20:13')
      .setAspectMode('cover')
      .setAction({
        type: 'uri',
        uri: 'http://linecorp.com/',
        label: 'go to line'
      })
      .build() as FlexImage

    const bodyBlockItem = FlexComponentBuilder.flexBox()
      .setLayout('baseline')
      .setSpacing('sm')
      .addContents(
        FlexComponentBuilder.flexText()
          .setText('PRICE')
          .setColor('#aaaaaa')
          .setSize('sm')
          .setFlex(1)
          .build(),
        FlexComponentBuilder.flexText()
          .setText(rp.amount ? `${rp.amount} ${rp.currency}` : 'FREE')
          .setWrap(true)
          .setColor('#666666')
          .setSize('sm')
          .setFlex(5)
          .setAlign('end')
          .build()
      )
      .build()

    const bodyBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .addContents(
        FlexComponentBuilder.flexText()
          .setText(rp.productName)
          .setWrap(true)
          .setWeight('bold')
          .setSize('xl')
          .build(),
        FlexComponentBuilder.flexText()
          .setText(rp.productDescription)
          .setWrap(true)
          .setSize('sm')
          .build(),
        FlexComponentBuilder.flexBox()
          .setLayout('vertical')
          .setMargin('lg')
          .setSpacing('sm')
          .addContents(bodyBlockItem)
          .build()
      )
      .build()

    const createPayButton = () => {
      if (rp.amount) {
        return FlexComponentBuilder.flexButton()
          .setStyle('link')
          .setHeight('sm')
          .setAction({
            type: 'uri',
            label: 'Pay with LINE Pay',
            uri: r.paymentUrl ? r.paymentUrl.web : ''
          })
          .build()
      } else {
        const claimFreeItemIntent: ClaimFreeItemEventMessageIntent = {
          name: ClaimFreeItemEventMessageIntentKind,
          parameters: {
            productName: rp.productName,
            productDescription: rp.productDescription,
            productImageUrl: rp.productImageUrl
          }
        }

        return FlexComponentBuilder.flexButton()
          .setStyle('link')
          .setHeight('sm')
          .setAction({
            type: 'postback',
            label: 'CLAIM',
            data: JSON.stringify(claimFreeItemIntent)
          })
          .build()
      }
    }

    const footerBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setSpacing('sm')
      .setFlex(0)
      .addContents(
        FlexComponentBuilder.flexSpacer()
          .setSize('sm')
          .build(),
        createPayButton()
      )
      .build()

    return lineTemplate
      .flexMessage('pay')
      .addBubble()
      .addHero(heroBlock)
      .addBody()
      .setLayout('vertical')
      .addComponents(bodyBlock)
      .addFooter()
      .addComponents(footerBlock)
      .build()
  };

  [ConfirmPaymentResultMessageType]: PaymentParserFunc<Message, typeof ConfirmPaymentResultMessageType> = (c: ConfirmPaymentResultMessage, payload: ReservePaymentMessage) => {
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
      .addContents(createItem(payload.productName, `${payload.amount}`, payload.productImageUrl))
      .build()

    const bodySummaryBlock = FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setMargin('xxl')
      .setSpacing('sm')
      .addContents(createItem('TOTAL', `${c.amount} ${c.currency} `))
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
          .setText(c.transactionId)
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

  [ReservePaymentMessageType]: PaymentParserFunc<Message, typeof ReservePaymentMessageType> = (r: ReservePaymentMessage) => {
    return {
      type: 'text',
      text: r.type
    }
  }
}
