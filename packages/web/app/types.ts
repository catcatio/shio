import { Configuration as ChatEngineSettings, LineSettings } from '@shio-bot/chatengine/types'
import { OutgoingMessage, IncomingMessage, ReservePaymentMessage, ConfirmPaymentMessage, MessageFulfillment } from '@shio-bot/foundation/entities'
import express = require('express')
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub'

export type Configurations = {
  serviceName: string
  host: string
  port: number
  chatEngine: ChatEngineSettings
  pubsub: PubSubSettings
  intentProvider: string
}

export interface PubSubSettings {
  devPubSub?: boolean
  cloudPubSub?: ClientConfig
}

export type FulfillmentListener = (message: OutgoingMessage) => Promise<void>

export type ReservePaymentListener = (payload: ReservePaymentMessage) => Promise<void>

export interface Endpoint extends express.RequestHandler {
  path: string
}

export interface Fulfillment {
  onFulfillment(listener: FulfillmentListener): void
  publishIntent(msg: IncomingMessage): Promise<void>
}

export interface Payment {
  onReservePayment(listener: ReservePaymentListener): void
  confirmPayment(msg: ConfirmPaymentMessage): Promise<void>
}

export type NarrowUnion<T, N> = T extends { name: N } ? T : never
export type FulfillmentparserFunc<M, F> = (fulfillment: NarrowUnion<MessageFulfillment, F>) => M
export type PaymentParserFunc<M, P> = (message: NarrowUnion<ConfirmPaymentMessage, P>, reservePayment: NarrowUnion<ConfirmPaymentMessage, ReservePaymentMessage>) => M

export type MessageFulfillmentParserList<T> = { [key in MessageFulfillment['name']]: FulfillmentparserFunc<T, key> }
export type MessagePaymentParserList<T> = { [key in ConfirmPaymentMessage['type']]: PaymentParserFunc<T, key> }

export type LineFulfillmentParserOption = {
  setting: LineSettings
}

export interface Product {
  name: string
  description?: string
  price: number
  imageUrl: string
}
export interface ReserveInformation {
  totalPrice: number
  currency: string
  product: Product
  orderId: string
  transactionId?: string
  paymentUrl: {
    app: string
    web: string
  }
}

export interface ReceiptInformation {
  totalPrice: number
  currency: string
  product: Product
  orderId: string
  transactionId?: string
}
