import { BoardingUsecase } from '../usecases/boarding'
import { createOutgoingFromIncomingMessage } from '@shio-bot/foundation/entities'
import { EndpointFuntion, createEndpointFunction } from './default'
import { GlobalError } from '../entities/error'

export function makeFollowEndpoint(boarding: BoardingUsecase): EndpointFuntion {
  return createEndpointFunction('follow', async message => {
    try {
      const output = await boarding.userFollow({
        displayName: message.intent.parameters.displayName,
        provider: message.provider,
        providerId: message.source.userId
      })

      return createOutgoingFromIncomingMessage(message, [
        {
          name: 'follow',
          parameters: {
            chatSessionId: output.userChatSession.id,
            userId: output.user.id,
            isCompleted: true
          }
        }
      ])
    } catch (e) {
      if (e instanceof GlobalError) {
        return createOutgoingFromIncomingMessage(message, [
          {
            name: 'follow',
            parameters: {
              isCompleted: false,
              description: e.toString()
            }
          }
        ])
      } else {
        throw e
      }
    }
  })
}
