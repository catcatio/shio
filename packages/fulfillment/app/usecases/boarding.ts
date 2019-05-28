import { MessageProvider } from '@shio/foundation/entities'
import { User, UserChatSession } from '../entities'
import { UserRepository, WithSystemOperation, ACLRepository } from '../repositories'

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
