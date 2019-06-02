import { intentDetectorProvider, messagingClientProvider } from './providers'
import { Configuration, IntentDetectorProvider, MessagingClientProvider } from '../types'
import { DialogflowIntentDetector } from '../dialogflow/intentDetector'
import { Router } from 'express'
import { ParsedMessageNotifier } from './notifier'
import { setup as lineSetup, LineMessagingClient } from '../line'
import { FlukeIntentDetector } from '../fluke'

export class ChatEngine extends ParsedMessageNotifier {
  private _intents = intentDetectorProvider()
  private _msgClients = messagingClientProvider()

  private _initIntentProvider() {
    if (this.config.fluke) {
      this._intents.add(new FlukeIntentDetector(this.config.fluke))
    }

    if (this.config.dialogflow) {
      this._intents.add(new DialogflowIntentDetector(this.config.dialogflow))
    }
  }

  private _initMessagingClientProvider() {
    if (this.config.line) {
      this._msgClients.add(new LineMessagingClient(this.config.line))
    }
  }

  constructor(private config: Configuration) {
    super()
    this._initIntentProvider()
    this._initMessagingClientProvider()
  }

  public buildRouter(): Router {
    let router = Router()

    if (this.config.line) {
      lineSetup(router, this, this.config.line)
    }

    if (this.config.linepay) {
    }

    return router
  }

  public get intentDetectorProvider(): IntentDetectorProvider {
    return this._intents
  }

  public get messagingClientProvider(): MessagingClientProvider {
    return this._msgClients
  }
}
