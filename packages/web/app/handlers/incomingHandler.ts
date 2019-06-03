import { ParsedMessage, Intent, IntentDetector, MessagingClientProvider } from '@shio-bot/chatengine/types'
import { PublishIncommingMessageInput } from '@shio-bot/foundation'
import { v4 as uuid } from 'uuid'
import { Fulfillment } from '../types'

export const intentMessageHandler = (fulfillment: Fulfillment, intentDetector: IntentDetector, messagingClientProvider: MessagingClientProvider) => {
  const handle = async (msg: ParsedMessage) => {
    // get intent
    let intent = intentDetector.isSupport(msg.type) ? await intentDetector.detect(msg) : await Promise.resolve({ name: `${msg.type}`, parameters: {} } as Intent)

    if (!intent) {
      console.error('unable to detect intent', JSON.stringify(msg))
      return
    }

    let msgClient = messagingClientProvider.get(msg.provider)
    let userProfile = await msgClient
      .getProfile({
        provider: 'line',
        userId: msg.source.userId
      })
      .catch(err => {
        return { userId: '', displayName: '', pictureUrl: '' }
      })

    // pub message
    let requestId = uuid()

    let input: PublishIncommingMessageInput = {
      intent: intent as any,
      provider: msg.provider as any,
      replyToken: msg.replyToken,
      languageCode: 'en',
      type: msg.type,
      source: msg.source,
      userProfile: {
        userId: userProfile.userId,
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl
      },
      timestamp: msg.timestamp,
      original: msg.original,
      requestId: requestId
    }

    console.log('PublishIncommingMessageInput', JSON.stringify(input))
    fulfillment
      .publishIntent(input)
      .then(_ => console.log('incoming message published:', requestId))
      .catch(err => console.error(err))
  }

  return {
    handle
  }
}
