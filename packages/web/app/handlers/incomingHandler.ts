import { ParsedMessage, Intent, IntentDetector, MessagingClientProvider } from '@shio-bot/chatengine/types'
import { PublishIncommingMessageInput, newLogger } from '@shio-bot/foundation'
import { v4 as uuid } from 'uuid'
import { Fulfillment } from '../types'
import { validateMessageIntent, MessageIntent } from '@shio-bot/foundation/entities';


export function tryBypassMessage(value: any) {
  if (typeof value !== 'string') {
    return undefined
  }
  const bypassPattern = /^shio bypass (.+?(?="))"(.+)"$/
  let match = bypassPattern.exec(value)
  if (!match) {
    return undefined
  }
  return {
    name: match[1].trim(),
    parameters: JSON.parse(match[2])
  }
}

export const intentMessageHandler = (fulfillment: Fulfillment, intentDetector: IntentDetector, messagingClientProvider: MessagingClientProvider) => {
  const log = newLogger()
  const handle = async (msg: ParsedMessage) => {


    // get intent
    let intent: MessageIntent

    // bypass intent parser with special format
    // for debugging and testing
    // example:
    // shio bypass list-item "{\"offset\": 5}"
    // shio bypass follow
    log.info("incoming message: " + msg.message)
    const byPassMessage = tryBypassMessage(msg.message)
    if (byPassMessage) {
      log.info("bypass intent parser with special command: " + msg.message)
      const { value, error } = validateMessageIntent(byPassMessage)
      if (error){
        log.error(JSON.stringify(error.details))
        return
      }
      intent = value
    } else {
      // basic conversation text
      // perform intent detactor
      intent = intentDetector.isSupport(msg.type) ? await intentDetector.detect(msg) : await Promise.resolve({ name: `${msg.type}`, parameters: {} } as Intent) as any
    }

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

    let input: PublishIncomingMessageInput = {
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
