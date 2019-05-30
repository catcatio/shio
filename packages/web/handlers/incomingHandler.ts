import { ParsedMessage, Intent, IntentDetector } from '@shio-bot/chatengine/types'
import { CloudPubsubTransport, PublishIncommingMessageInput } from '@shio-bot/foundation'
import { v4 as uuid } from 'uuid'

export const incomingMessageHandler = (intentDetector: IntentDetector, pubsub: CloudPubsubTransport) => {
  const handle = async (msg: ParsedMessage) => {
    // get intent
    let intent = intentDetector.isSupport(msg.type) ? await intentDetector.detect(msg) : await Promise.resolve({ name: `${msg.type}`, parameters: {} } as Intent)

    if (!intent) {
      console.error('unable to detect intent', JSON.stringify(msg))
      return
    }

    // pub message
    let requestId = uuid()

    let input: PublishIncommingMessageInput = {
      intent: intent as any,
      provider: msg.provider as any,
      replyToken: msg.replyToken,
      languageCode: 'en',
      type: msg.type,
      source: msg.source,
      timestamp: msg.timestamp,
      original: msg.original,
      requestId: requestId
    }
    console.log(JSON.stringify(input))
    pubsub
      .PublishIncommingMessage(input)
      .then(_ => console.log('incoming message published:', requestId))
      .catch(err => console.error(err))

    // pubsub.PublishOutgoingMessage(input as any)
    //   .then(_ => console.log('outgoing message published:', requestId))
    //   .catch(err => console.error(err))
  }

  return {
    handle
  }
}
