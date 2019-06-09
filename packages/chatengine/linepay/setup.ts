import { Router, Request, Response } from 'express'
import { LinePaySettings, IPaymentNotifier, ConfirmTransaction, PaymentConfirmRequest, PaymentConfirmResponse } from '../types'
const LinePay = require('line-pay')

export const setup = (router: Router, notifier: IPaymentNotifier, linepaySettings: LinePaySettings) => {
  const path = linepaySettings.routerPath || '/linepayconfirm'
  const linepay = new LinePay(linepaySettings.clientConfig)

  let confirmTransaction: ConfirmTransaction = async (confirmRequest: PaymentConfirmRequest): Promise<PaymentConfirmResponse> => {
    let response = await linepay.confirm(confirmRequest)
    console.log(response)
    return response
  }

  router.post(path, (req: Request, res: Response) => {
    if (!req.query || req.query.transactionId) {
      console.log('bad request')
      return res.status(400).send('bad request')
    }

    notifier.notify(req.query, confirmTransaction)

    res.send('OK')
  })
}
