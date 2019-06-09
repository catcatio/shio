import { MessageChannelTransport, MessageChannelManager } from "@shio-bot/foundation";



export class DefaultPubsubRepository {

  private pubsub: MessageChannelManager
  constructor(pubsub: MessageChannelManager) {
    this.pubsub = pubsub
  }

}