import { IncomingMessage, OutgoingMessage } from '../entities/message'
import { PaginationResult, PartialCommonAttributes } from '../entities/common'
import { RepositoryOperationOption, composeRepositoryOptions } from './common'
import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub'
import { PUBSUB_INCOMING_MESSAGE_TOPIC, PUBSUB_FULLFILLMENT_SUBSCRIPTION } from './database'
import { ACLRepository } from './acl'
import { newResourceTag, Permission } from '../entities'

interface MessageRepositoryOperationOption extends RepositoryOperationOption<{}> {}
interface CreateIncomingMessageInput extends IncomingMessage {}
type SubscribeIncomingMessageListener = (message: IncomingMessage) => Promise<void> | void

export interface MessageRepository {
  CreateIncomingMessage(input: CreateIncomingMessageInput, ...opts: MessageRepositoryOperationOption[]): Promise<void>
  SubscribeIncomingMessage(listener: SubscribeIncomingMessageListener): void
  UnsubscribeAllIncomingMessage(): void
  CreateOutgoingMessage(): Promise<OutgoingMessage>
  FindManyOutgoingMessage(): Promise<PaginationResult<OutgoingMessage>>
}

export class CloudPubSubMessageRepository implements MessageRepository {
  private tag = 'message'
  private pubsub: PubSub
  private topic: Topic
  private subscription: Subscription
  private acl: ACLRepository
  constructor(pubsub: PubSub, acl: ACLRepository) {
    this.pubsub = pubsub
    this.topic = this.pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
    this.subscription = this.topic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
    this.acl = acl
  }

  async CreateIncomingMessage(input: CreateIncomingMessageInput, ...opts: MessageRepositoryOperationOption[]): Promise<void> {
    const option = composeRepositoryOptions(...opts)
    await this.acl.IsGrantedOrThrow(option.operationOwnerId, newResourceTag('message'), Permission.WRITER)
    await this.topic.publishJSON({
      ...input
    })
  }
  SubscribeIncomingMessage(callback: SubscribeIncomingMessageListener) {
    this.subscription.on('message', (message: Message) => {
      const data = JSON.parse(message.data.toString('utf-8'))
      const f = callback({ ...data })
      if (f && typeof f.then === 'function') {
        f.then(() => message.ack())
      } else {
        message.ack()
      }
    })
  }
  UnsubscribeAllIncomingMessage(): void {
    this.subscription.removeAllListeners('message')
  }
  CreateOutgoingMessage(): Promise<OutgoingMessage> {
    throw new Error('Method not implemented.')
  }
  FindManyOutgoingMessage(): Promise<PaginationResult<OutgoingMessage>> {
    throw new Error('Method not implemented.')
  }
}
