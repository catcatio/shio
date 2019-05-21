import { RepositoryOperationOption, composeRepositoryOptions } from './common'
import { IncomingMessage, OutgoingMessage, PaginationResult } from '@shio/foundation/entities'
import { CloudPubsubTransports } from '@shio/foundation'
import { ACLRepository } from './acl'
import { newResourceTag, Permission } from '../entities'

interface MessageRepositoryOperationOption extends RepositoryOperationOption<{}> {}
interface CreateIncomingMessageInput extends IncomingMessage {}
type SubscribeIncomingMessageListener = (message: IncomingMessage) => Promise<void> | void

export interface MessageRepository {
  CreateIncomingMessage(input: CreateIncomingMessageInput, ...opts: MessageRepositoryOperationOption[]): Promise<void>
  SubscribeIncomingMessage(listener: SubscribeIncomingMessageListener, ...opts: MessageRepositoryOperationOption[]): void
  UnsubscribeAllIncomingMessage(): void
  CreateOutgoingMessage(): Promise<OutgoingMessage>
  FindManyOutgoingMessage(): Promise<PaginationResult<OutgoingMessage>>
}

export class CloudPubSubMessageRepository implements MessageRepository {

  private tag = newResourceTag('message')
  private acl: ACLRepository
  private pubsub: CloudPubsubTransports

  constructor(pubsub: CloudPubsubTransports, acl: ACLRepository) {
    this.acl = acl
    this.pubsub = pubsub
  }

  async CreateIncomingMessage(input: CreateIncomingMessageInput, ...opts: MessageRepositoryOperationOption[]): Promise<void> {
    const option = composeRepositoryOptions(...opts)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, this.tag, Permission.WRITER)
    await this.pubsub.PublishIncommingMessage(input)
  }
  async SubscribeIncomingMessage(callback: SubscribeIncomingMessageListener, ...opts: MessageRepositoryOperationOption[]) {
    const option = composeRepositoryOptions(...opts)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, this.tag, Permission.WRITER)
    this.pubsub.SubscribeIncommingMessage(callback)
  }
  UnsubscribeAllIncomingMessage(): void {
    this.pubsub.UnsubscribeAllIncomingMessage()
  }
  CreateOutgoingMessage(): Promise<OutgoingMessage> {
    throw new Error('Method not implemented.')
  }
  FindManyOutgoingMessage(): Promise<PaginationResult<OutgoingMessage>> {
    throw new Error('Method not implemented.')
  }
}
