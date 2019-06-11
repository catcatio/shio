import { PaymentNotifier } from './notifier'
import { Configuration, PaymentClientProvider } from '../types'
import { Router } from 'express'
import { setup as linepaySetup, LinePaymentClient } from '../linepay'
import { paymentClientProvider } from './providers'

export class PaymentEngine extends PaymentNotifier {
  private _payments = paymentClientProvider()
  constructor(private config: Configuration) {
    super()
  }

  public buildRouter(): Router {
    let router = Router()

    if (this.config.linepay) {
      linepaySetup(router, this, this.config.linepay)
      this._payments.add(new LinePaymentClient(this.config.linepay))
    }

    return router
  }

  public get paymentClientProvider(): PaymentClientProvider {
    return this._payments
  }
}
