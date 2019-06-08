import { MessageProvider } from '@shio-bot/foundation/entities'
import { User, UserChatSession } from '../entities'
import { ACLRepository, UserRepository, WithSystemOperation, WithWhere, OperationOption, composeOperationOptions } from '../repositories'
import { createUserError } from './errors';

interface BoardingUserFollowInput {
  displayName: string
  providerId: string
  provider: MessageProvider
}
interface BoardingUserFollowOutput {
  user: User
  userChatSession: UserChatSession
}
export interface BoardingUsecase {
  userFollow(input: BoardingUserFollowInput, ...options: OperationOption[]): Promise<BoardingUserFollowOutput>
  getUserChatSession(provider: MessageProvider, userId: string): Promise<UserChatSession | undefined>
}

export class DefaultBoardingUsecase implements BoardingUsecase {
  private User: UserRepository
  private ACL: ACLRepository
  constructor(user: UserRepository, acl: ACLRepository) {
    this.User = user
    this.ACL = acl
  }

  public async getUserChatSession(provider: MessageProvider, providerId: string): Promise<UserChatSession | undefined> {
    return this.User.findOneChatSession(
      WithWhere<UserChatSession>({
        provider: {
          Equal: provider,
        },
        providerId: {
          Equal: providerId,
        }
      }),
      WithSystemOperation(),
    )
  }

  public async userFollow(input: BoardingUserFollowInput, ...options: OperationOption[]): Promise<BoardingUserFollowOutput> {

    const option = composeOperationOptions(...options)

    option.logger.withFields({ userId: input.providerId, provider: input.provider }).info("checking if user exists")
    const isUserExists = await this.User.findOneChatSession(
      WithWhere<UserChatSession>({
        provider: {
          Equal: input.provider
        },
        providerId: {
          Equal: input.providerId,
        },
      })
    )
    if (isUserExists) {
      throw createUserError(input.provider, input.providerId)
    }

    const user = await this.User.create(
      {
        displayName: input.displayName
      },
      WithSystemOperation()
    )

    const session = await this.User.createChatSession(
      {
        provider: input.provider,
        providerId: input.providerId,
        userId: user.id
      },
      WithSystemOperation()
    )

    return {
      user,
      userChatSession: session
    }
  }
}
