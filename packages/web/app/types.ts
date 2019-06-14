import { Configuration as ChatEngineSettings } from '@shio-bot/chatengine/types'
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
export type PaymentParserFunc<M, P> = (message: NarrowUnion<PaymentMessage, P>, payload?: any) => M

export type PaymentMessage = ConfirmPaymentMessage | ReservePaymentMessage

export type MessageFulfillmentParser<T> = { [key in MessageFulfillment['name']]: FulfillmentparserFunc<T, key> }
export type MessagePaymentParser<T> = { [key in PaymentMessage['type']]: PaymentParserFunc<T, key> }
