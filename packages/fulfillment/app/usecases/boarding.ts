import { MessageProvider } from '@shio-bot/foundation/entities'
import { User, UserChatSession } from '../entities'
import { ACLRepository, UserRepository, WithSystemOperation, WithWhere, OperationOption, composeOperationOptions } from '../repositories'
import { createUserError } from './errors';
import { GlobalError, ErrorType, newGlobalError } from '../entities/error';

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
  getUserProfileOrThrow(provider: MessageProvider, userId: string, ...options: OperationOption[]): Promise<User>
}

export class DefaultBoardingUsecase implements BoardingUsecase {
  private User: UserRepository
  private ACL: ACLRepository
  constructor(user: UserRepository, acl: ACLRepository) {
    this.User = user
    this.ACL = acl
  }

  async getUserProfileOrThrow(provider: MessageProvider, providerUserId: string, ...options: OperationOption<any>[]): Promise<User> {
    const session = await this.getUserChatSession(provider,providerUserId)
    if (!session) {
      throw newGlobalError(ErrorType.NotFound, "user not found")
    }
    const user = await this.User.findById(session.userId, ...options)
    if (!user) {
      throw newGlobalError(ErrorType.NotFound, "user not found")
    }
    return user
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

    //@TODO: 
    // must verfiy provider and providerUserId
    // to chat provider ensure real provider chat message
    // identifier

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
