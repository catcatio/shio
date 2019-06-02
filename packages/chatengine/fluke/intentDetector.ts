import { IntentDetector, ParsedMessage, Intent, empty, MessageType, FlukeSettings } from '../types'

export class FlukeIntentDetector implements IntentDetector {
  name = 'fluke'

  constructor(private settings: FlukeSettings) {}

  isSupport(msgType: MessageType): boolean {
    return msgType === 'textMessage'
  }

  async detect(parsedMessage: ParsedMessage): Promise<Intent | empty> {
    if (!this.settings.intentMap || typeof parsedMessage.message !== 'string') return null

    let intent = this.settings.intentMap[parsedMessage.message] || this.settings.intentMap['unknown']

    return typeof intent === 'function' ? intent(parsedMessage.message) : intent
  }
}
