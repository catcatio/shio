import { Router, Request, Response } from 'express'
import { LinePaySettings, IPaymentNotifier, ConfirmTransaction, PaymentConfirmRequest, PaymentConfirmResponse } from '../types'
const LinePay = require('line-pay')

export const setup = (router: Router, notifier: IPaymentNotifier, linepaySettings: LinePaySettings) => {
  const path = linepaySettings.routerPath || '/linepayconfirm'
  const linepay = new LinePay(linepaySettings.clientConfig)

  router.get(path, (req: Request, res: Response) => {
    if (!req.query || !req.query.transactionId || !req.query.orderId) {
      console.log('not found: incomplete parameters')
      return res.status(404).send('not found')
    }

    let confirmTransaction: ConfirmTransaction = async (confirmRequest: PaymentConfirmRequest, error: Error): Promise<PaymentConfirmResponse> => {
      if (error) {
        res.status(404).send('not found')
        return null as any
      }

      try {
        let response = await linepay.confirm(confirmRequest)
        res.status(200).send('OK')
        return response
      } catch (err) {
        console.log('linepay.confirm failed', err)
        res.status(500).send('internal error')
        throw err
      }
    }

    notifier.notify(req.query, confirmTransaction)
  })
}
