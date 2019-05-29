import { MessageProvider } from '@shio/foundation/entities'
import { User, UserChatSession } from '../entities'
import { UserRepository, WithSystemOperation, ACLRepository, WithWhere } from '../repositories'
import { createUserError } from './errors';

type BoardingUserFollowInput = {
  displayName: string
  providerId: string
  provider: MessageProvider
}
type BoardingUserFollowOutput = {
  user: User
  userChatSession: UserChatSession
}
export interface BoardingUsecase {
  userFollow(input: BoardingUserFollowInput): Promise<BoardingUserFollowOutput>
}

export class DefaultBoardingUsecase implements BoardingUsecase {
  private User: UserRepository
  private ACL: ACLRepository
  constructor(user: UserRepository, acl: ACLRepository) {
    this.User = user
    this.ACL = acl
  }

  async userFollow(input: BoardingUserFollowInput): Promise<BoardingUserFollowOutput> {

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
      throw createUserError(input.provider,input.providerId)
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
