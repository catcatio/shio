import { FlexMessage, FlexImage } from '@line/bot-sdk'
import { FlexMessageBuilder, FlexComponentBuilder } from '@shio-bot/chatengine/line/helpers/lineMessageBuilder'
import { ReceiptInformation, ReserveInformation, Product } from '../../types'
import {
  ClaimFreeItemEventMessageIntent,
  ClaimFreeItemEventMessageIntentKind,
  AssetMetadataBookKind,
  PurchaseItemEventMessageIntent,
  PurchaseItemEventMessageIntentKind,
  ListItemEventMessageFulfillment
} from '@shio-bot/foundation/entities'

export const createReceiptFlexMessage = (info: ReceiptInformation): FlexMessage => {
  const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()

  const createItem = (name: string, price: string, imageUrl?: string) => {
    const box = FlexComponentBuilder.flexBox().setLayout('horizontal')
    if (imageUrl) {
      box.addContents(
        FlexComponentBuilder.flexImage()
          .setUrl(imageUrl)
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
          .setText(price || 'FREE')
          .setSize('sm')
          .setColor('#111111')
          .setFlex(1)
          .setAlign('end')
          .build()
      )
      .build()
  }

  const createHeaderBlock = (orderId: string) =>
    FlexComponentBuilder.flexBox()
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
          .build(),
        FlexComponentBuilder.flexBox()
          .setLayout('baseline')
          .setMargin('xs')
          .addContents(
            FlexComponentBuilder.flexText()
              .setText('ORDER ID')
              .setSize('xs')
              .setColor('#aaaaaa')
              .setFlex(0)
              .build(),
            FlexComponentBuilder.flexText()
              .setText(orderId || '1234567890') // sometimes do not have orderID [Case pay with line pay]
              .setSize('xs')
              .setWrap(true)
              .setColor('#aaaaaa')
              .setAlign('end')
              .build()
          )
          .build()
      )
      .build()

  const createBodyItemBlock = (product: Product) =>
    FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setMargin('xxl')
      .setSpacing('sm')
      .addContents(createItem(product.name, `${product.price}`, product.imageUrl))
      .build()

  const createBodySummaryBlock = (totalPrice: number, currency: string) =>
    FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setMargin('xxl')
      .setSpacing('sm')
      .addContents(createItem('TOTAL', totalPrice ? `${totalPrice} ${currency}` : 'FREE'))
      .build()

  const createFooterBlock = (transactionId: string) =>
    FlexComponentBuilder.flexBox()
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
          .setText(transactionId || '1234567890')
          .setSize('xs')
          .setColor('#aaaaaa')
          .setAlign('end')
          .build()
      )
      .build()

  const createSeparatorBlock = () =>
    FlexComponentBuilder.flexSeparator()
      .setMargin('xxl')
      .build()

  return lineTemplate
    .flexMessage('purchased receipt')
    .addBubble()
    .addHeader()
    .addComponents(createHeaderBlock(info.orderId))
    .addBody()
    .setLayout('vertical')
    .addComponents(
      createSeparatorBlock(),
      createBodyItemBlock(info.product),
      createSeparatorBlock(),
      createBodySummaryBlock(info.totalPrice, info.currency),
      createSeparatorBlock(),
      createFooterBlock(info.transactionId || '1234567890')
    )
    .build()
}

export const createPaymentFlexMessage = (info: ReserveInformation): FlexMessage => {
  const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()

  const createHeroBlock = (product: Product) =>
    FlexComponentBuilder.flexImage()
      .setUrl(product.imageUrl || '')
      .setSize('full')
      .setAspectRatio('20:13')
      .setAspectMode('cover')
      .setAction({
        type: 'uri',
        uri: 'http://linecorp.com/',
        label: 'go to line'
      })
      .build() as FlexImage

  const createBodyBlockItem = (price: number, currency: string) =>
    FlexComponentBuilder.flexBox()
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
          .setText(price ? `${price} ${currency}` : 'FREE')
          .setWrap(true)
          .setColor('#666666')
          .setSize('sm')
          .setFlex(5)
          .setAlign('end')
          .build()
      )
      .build()

  const createBodyBlock = (product: Product, currency: string) =>
    FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .addContents(
        FlexComponentBuilder.flexText()
          .setText(product.name)
          .setWrap(true)
          .setWeight('bold')
          .setSize('xl')
          .build(),
        FlexComponentBuilder.flexText()
          .setText(product.description)
          .setWrap(true)
          .setSize('sm')
          .build(),
        FlexComponentBuilder.flexBox()
          .setLayout('vertical')
          .setMargin('lg')
          .setSpacing('sm')
          .addContents(createBodyBlockItem(product.price, currency))
          .build()
      )
      .build()

  const createPayButton = (paymentUrl: string, price: number, orderId: string) => {
    if (price) {
      return FlexComponentBuilder.flexButton()
        .setStyle('link')
        .setHeight('sm')
        .setAction({
          type: 'uri',
          label: 'Pay with LINE Pay',
          uri: paymentUrl
        })
        .build()
    } else {
      const claimFreeItemIntent: ClaimFreeItemEventMessageIntent = {
        name: ClaimFreeItemEventMessageIntentKind,
        parameters: {
          orderId
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

  const createFooterBlock = () =>
    FlexComponentBuilder.flexBox()
      .setLayout('vertical')
      .setSpacing('sm')
      .setFlex(0)
      .addContents(
        FlexComponentBuilder.flexSpacer()
          .setSize('sm')
          .build(),
        createPayButton(info.paymentUrl.web, info.totalPrice, info.orderId)
      )
      .build()

  return lineTemplate
    .flexMessage('pay')
    .addBubble()
    .addHero(createHeroBlock(info.product))
    .addBody()
    .setLayout('vertical')
    .addComponents(createBodyBlock(info.product, info.currency))
    .addFooter()
    .addComponents(createFooterBlock())
    .build()
}

export const createListAssetFlexMessage = (assets: ListItemEventMessageFulfillment['parameters']['assets'], liffViewAssetUrl: string): FlexMessage => {
  const lineTemplate: FlexMessageBuilder = new FlexMessageBuilder()
  let template = lineTemplate.flexMessage(`book shelf`).addCarousel()

  assets.forEach(asset => {
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

      const createFooterBlock = () => {
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
              uri: liffViewAssetUrl + '?assetId=' + asset.id
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

      const bodies = asset.isOwnByOperationOwner ? [createBodyTitleBlock()] : [createBodyTitleBlock(), createBodyPriceBlock()]
      template = template
        .addBubble()
        .addHero(createHeroBlock())
        .addBody()
        .setLayout('vertical')
        .addComponents(...bodies)
        .addFooter()
        .addComponents(createFooterBlock())
    }
  })

  return template.build()
}
