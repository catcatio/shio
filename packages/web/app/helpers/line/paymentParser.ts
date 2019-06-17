import { MessagePaymentParserList, PaymentParserFunc } from '../../types'
import {
  ReservePaymentResultMessageType,
  ReservePaymentResultMessage,
  ReservePaymentMessage,
  ConfirmPaymentResultMessageType,
  ConfirmPaymentResultMessage,
  ClaimFreeItemEventMessageIntent,
  ClaimFreeItemEventMessageIntentKind
} from '@shio-bot/foundation/entities'
import { Message } from '@line/bot-sdk'
import { createReceiptFlexMessage, createPaymentFlexMessage } from './messageBuilder'

export class LinePayParser implements MessagePaymentParserList<Message> {
  [ReservePaymentResultMessageType]: PaymentParserFunc<Message, typeof ReservePaymentResultMessageType> = (r: ReservePaymentResultMessage, rp: ReservePaymentMessage) => {
    return createPaymentFlexMessage({
      totalPrice: rp.amount,
      currency: rp.currency,
      orderId: rp.orderId,
      transactionId: r.transactionId,
      paymentUrl: r.paymentUrl || { web: '', app: '' },
      product: {
        name: rp.productName,
        description: rp.productDescription,
        price: rp.amount,
        imageUrl: rp.productImageUrl || ''
      }
    })
  };

  [ConfirmPaymentResultMessageType]: PaymentParserFunc<Message, typeof ConfirmPaymentResultMessageType> = (c: ConfirmPaymentResultMessage, rp: ReservePaymentMessage) => {
    return createReceiptFlexMessage({
      totalPrice: c.amount,
      currency: c.currency,
      transactionId: c.transactionId,
      orderId: c.orderId,
      product: {
        name: rp.productName,
        description: rp.productDescription,
        price: rp.amount,
        imageUrl: rp.productImageUrl || ''
      }
    })
  }
}
