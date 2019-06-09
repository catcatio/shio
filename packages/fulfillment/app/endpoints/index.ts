import { BoardingUsecase } from "../usecases/boarding";
import { ListItemEventMessageIntentKind, FollowEventMessageIntentKind, IncomingMessage, createOutgoingFromIncomingMessage, ListItemEventMessageFulfillmentKind } from "../entities/asset";
import { MerchandiseUseCase } from "../usecases/merchandise";
import { EndpointFuntion, createEndpointFunction } from "./default";
import { UsecaseErrorMessages } from "../usecases";
import { GlobalError, newGlobalError, ErrorType } from "../entities/error";
import { WithOperationOwner, WithSystemOperation, WithIncomingMessage } from "../repositories";
import { UserChatSession } from "../entities";

export interface FulfillmentEndpoint {
  [FollowEventMessageIntentKind]: EndpointFuntion
  [ListItemEventMessageIntentKind]: EndpointFuntion
}

export class DefaultFulfillmentEndpoint {

  public [FollowEventMessageIntentKind]: EndpointFuntion = createEndpointFunction(FollowEventMessageIntentKind, async (message) => {
    try {
      const output = await this.boarding.userFollow(
        {
          displayName: message.intent.parameters.displayName,
          provider: message.provider,
          providerId: message.source.userId
        },
        WithSystemOperation(),
        WithIncomingMessage(message)
      )

      return createOutgoingFromIncomingMessage(message, [
        {
          name: 'follow',
          parameters: {
            chatSessionId: output.userChatSession.id,
            userId: output.user.id,
            isCompleted: true,
            isExists: false,
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
              isExists: e.message === UsecaseErrorMessages.USER_ALREADY_EXISTED,
              description: e.toString()
            }
          }
        ])
      } else {
        throw e
      }
    }

  })
  public [ListItemEventMessageIntentKind]: EndpointFuntion = createEndpointFunction(ListItemEventMessageIntentKind, async (message) => {

    const session = await this.getSessionFromIncomingMessageOrThrow(message)
    const { limit, offset } = message.intent.parameters
    const output = await this.merchandise.listItem(
      {
        limit: message.intent.parameters.limit,
        offset: message.intent.parameters.offset,
      },
      WithOperationOwner(session.userId)
    )
    return createOutgoingFromIncomingMessage(message, [
      {
        name: ListItemEventMessageFulfillmentKind,
        parameters: {
          assets: output.records,
          hasNext: false,
          hasPrev: false,
          limit: limit || 10,
          offset: offset || 0,
          merchantTitle: "Reed",
        },
      }
    ])
  })


  private boarding: BoardingUsecase
  private merchandise: MerchandiseUseCase

  private async getSessionFromIncomingMessage(incomingMessage: IncomingMessage) {
    return this.boarding.getUserChatSession(incomingMessage.provider, incomingMessage.source.userId)
  }
  private async getSessionFromIncomingMessageOrThrow(incomingMessage: IncomingMessage): Promise<UserChatSession> {
    let session = await this.getSessionFromIncomingMessage(incomingMessage)
    if (!session) {
      // try to create new one
      const result = await this.boarding.userFollow({
        displayName: incomingMessage.userProfile.displayName,
        provider: incomingMessage.provider,
        providerId: incomingMessage.source.userId,
      }) 
      session = result.userChatSession 
    }
    return session
  }

  constructor(boarding: BoardingUsecase, merchandise: MerchandiseUseCase) {
    this.boarding = boarding
    this.merchandise = merchandise
  }
}

export function createFulfillmentEndpoint(boarding: BoardingUsecase, merchandise: MerchandiseUseCase) {
  return new DefaultFulfillmentEndpoint(boarding, merchandise)
}