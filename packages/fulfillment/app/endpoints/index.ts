import { BoardingUsecase } from '../usecases/boarding'
import {
  ListItemEventMessageIntentKind,
  FollowEventMessageIntentKind,
  IncomingMessage,
  createOutgoingFromIncomingMessage,
  ListItemEventMessageFulfillmentKind,
  MessageIntent,
  GetItemDownloadUrlEventMessageFulfillmentKind,
  GetItemDownloadUrlEventMessageIntentKind,
  UnfollowEventMessageIntentKind,
  WhoMessageIntentKind,
  PurchaseItemEventMessageIntentKind
} from '../entities/asset'
import { MerchandiseUseCase } from '../usecases/merchandise'
import { EndpointFuntion, endpointFn, EndpointFunctionAncestor } from './default'
import { UserChatSession } from '../entities'
import { FollowEventMessageIntentEndpoint } from './Follow'
import { ListItemEventMessageIntentEndpoint } from './ListItem'
import { PurchaseItemEventMessageIntentEndpoint } from './Purchase'
import { GetItemDownloadUrlEventMessageIntentEndpoint } from './GetItemDownloadUrl'
import { InventoryUseCase } from '../usecases/inventory'
import { WhoMessageIntentEndpoint } from './Who'

export class DefaultFulfillmentEndpoint implements FulfillmentEndpoint, EndpointFunctionAncestor {
  public boarding: BoardingUsecase
  public merchandise: MerchandiseUseCase
  public inventory: InventoryUseCase
  constructor(boarding: BoardingUsecase, merchandise: MerchandiseUseCase, inventory: InventoryUseCase) {
    this.boarding = boarding
    this.merchandise = merchandise
    this.inventory = inventory
  }

  public [WhoMessageIntentKind] = WhoMessageIntentEndpoint(this)

  public [UnfollowEventMessageIntentKind] = endpointFn(UnfollowEventMessageIntentKind, async () => {})

  public [GetItemDownloadUrlEventMessageIntentKind] = GetItemDownloadUrlEventMessageIntentEndpoint(this)
  public [FollowEventMessageIntentKind] = FollowEventMessageIntentEndpoint(this)
  public [ListItemEventMessageIntentKind] = ListItemEventMessageIntentEndpoint(this)
  public [PurchaseItemEventMessageIntentKind] = PurchaseItemEventMessageIntentEndpoint(this)

  public async getSessionFromIncomingMessage(incomingMessage: IncomingMessage) {
    return this.boarding.getUserChatSession(incomingMessage.provider, incomingMessage.source.userId)
  }
  public async getSessionFromIncomingMessageOrThrow(incomingMessage: IncomingMessage): Promise<UserChatSession> {
    let session = await this.getSessionFromIncomingMessage(incomingMessage)
    if (!session) {
      // try to create new one
      const result = await this.boarding.userFollow({
        displayName: incomingMessage.userProfile.displayName,
        provider: incomingMessage.provider,
        providerId: incomingMessage.source.userId
      })
      session = result.userChatSession
    }
    return session
  }
}
export type FulfillmentEndpoint = {
  [key in MessageIntent['name']]: EndpointFuntion
}
