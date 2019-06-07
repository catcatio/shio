import { IntentDetector, IntentDetectorProvider, MessagingClientProvider, MessagingClient } from '../types'

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
