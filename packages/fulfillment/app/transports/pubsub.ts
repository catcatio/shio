import { CloudPubsubTransports, newLogger } from '@shio/foundation'
import { BoardingUsecase } from '../usecases/boarding'

export function registerPubsub(pubsub: CloudPubsubTransports, boarding: BoardingUsecase) {

  const log = newLogger()

  pubsub.SubscribeIncommingMessage(async (message, ack) => {
    log.info(`Incoming message from ${message.provider}`)
    switch (message.intent.name) {
      case 'follow':
        const output = await boarding.userFollow({
          displayName: message.intent.parameters.displayName,
          provider: message.provider,
          providerId: message.source.userId
        })
        log.info(JSON.stringify(output))
        pubsub.PublishOutgoingMessage({
          fulfillment: {
            name: 'follow',
            parameters: {
              isCompleted: true
            }
          },
          languageCode: message.languageCode,
          provider: message.provider,
          replyToken: message.replyToken,
        })
        ack()
        break
      default:
        ack()
        break
    }
  })
}
