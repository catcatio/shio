import { endpointFn, EndpointFunctionAncestor } from './default'
import { PurchaseItemEventMessageIntentKind, ReservePaymentMessage } from '../entities/asset'
import * as uuid from 'uuid/v4'

export const PurchaseItemEventMessageIntentEndpoint = (ancestor: EndpointFunctionAncestor) =>
  endpointFn(PurchaseItemEventMessageIntentKind, async message => {
    const { merchantTitle } = message.intent.parameters

    // TODO: create
    const reservePaymentMessage: ReservePaymentMessage = {
      type: 'ReservePayment',
      provider: 'linepay',
      orderId: uuid(), // primary key of purchasing
      productName: merchantTitle,
      productImageUrl: 'https://static.reeeed.com/book/cjn66col600cw08027wemah6s/thumbnail-large.jpg', // optional
      amount: 120, // unit price
      currency: 'THB',
      source: message.source
    }

    return reservePaymentMessage
  })
