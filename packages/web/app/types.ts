import { Configuration as ChatEngineSettings } from '@shio-bot/chatengine/types'
import { OutgoingMessage, IncomingMessage } from '@shio-bot/foundation/entities'
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

export interface Endpoint extends express.RequestHandler {
  path: string
}

export interface Fulfillment {
  onFulfillment(listener: FulfillmentListener): void
  publishIntent(msg: IncomingMessage): Promise<void>
}
