import { PaymentNotifier } from './notifier'
import { Configuration } from '../types'
import { Router } from 'express'
import { setup as linepaySetup } from '../linepay'

export class PaymentEngine extends PaymentNotifier {
  constructor(private config: Configuration) {
    super()
  }

  public buildRouter(): Router {
    let router = Router()

    if (this.config.linepay) {
      linepaySetup(router, this, this.config.linepay)
    }

    return router
  }
}
