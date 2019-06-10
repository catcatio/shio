import { PaymentClient, LinePaySettings, LineReservePaymentRequest } from '../types'
const LinePay = require('line-pay')

export class LinePaymentClient implements PaymentClient {
  private linepay: any
  constructor(settings: LinePaySettings) {
    this.linepay = new LinePay(settings.clientConfig)
  }

  async reserve(request: LineReservePaymentRequest): Promise<LineReservePaymentRequest> {
    let response = await this.linepay.reserve(request)
    return response
  }
}
