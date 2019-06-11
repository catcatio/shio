import { PaymentClient, LinePaySettings, LineReservePaymentRequest, ReservePaymentRequest, ReservePaymentResponse } from '../types'
const LinePay = require('line-pay')

export class LinePaymentClient implements PaymentClient {
  name = 'linepay'
  private linepay: any
  constructor(settings: LinePaySettings) {
    this.linepay = new LinePay(settings.clientConfig)
  }

  async reserve(request: ReservePaymentRequest): Promise<ReservePaymentResponse> {
    let response = await this.linepay.reserve(request)
    return response
  }
}
