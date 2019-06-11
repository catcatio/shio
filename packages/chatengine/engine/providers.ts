import { IntentDetector, IntentDetectorProvider, MessagingClientProvider, MessagingClient, PaymentClient, PaymentClientProvider } from '../types'

export const messagingClientProvider = (): MessagingClientProvider => {
  const providers: { [name: string]: MessagingClient } = {}

  const add = (client: MessagingClient): void => {
    providers[client.name] = client
  }

  const get = (name: string): MessagingClient => {
    let messagingClinet = providers[name]

    if (!messagingClinet) {
      throw new Error('not found')
    }

    return messagingClinet
  }

  return {
    add,
    get
  }
}

export const intentDetectorProvider = (): IntentDetectorProvider => {
  const providers: { [name: string]: IntentDetector } = {}

  const add = (detector: IntentDetector): void => {
    providers[detector.name] = detector
  }

  const get = (name: string): IntentDetector => {
    let intentDetector = providers[name]

    if (!intentDetector) {
      throw new Error('not found')
    }

    return intentDetector
  }

  return {
    add,
    get
  }
}

export const paymentClientProvider = (): PaymentClientProvider => {
  const providers: { [name: string]: PaymentClient } = {}

  const add = (payment: PaymentClient): void => {
    providers[payment.name] = payment
  }

  const get = (name: string): PaymentClient => {
    let payment = providers[name]

    if (!payment) {
      throw new Error('not found')
    }

    return payment
  }

  return {
    add,
    get
  }
}
