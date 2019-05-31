import { LineSettings } from '@shio-bot/chatengine/types'
import { OutgoingMessage, IncomingMessage } from '@shio-bot/foundation/entities'
import express = require('express')

export type Configurations = {
  serviceName: string
  port: number
  chatEngine: ChatEngineSettings
  pubsub: any
}

export type ChatEngineSettings = {
  line: LineSettings
  dialogflow: any
}

export type FulfillmentListener = (message: OutgoingMessage) => Promise<void>

export interface Endpoint extends express.RequestHandler {
  path: string
}

export interface Fulfillment {
  onFulfillment(listener: FulfillmentListener): void
  publishIntent(msg: IncomingMessage): Promise<void>
}
