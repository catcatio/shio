import { DatastoreACLRepository } from '../acl'
import { newResourceTag, Permission, SYSTEM_USER } from '../../entities'
import { Datastore } from '@google-cloud/datastore'
import { PubSub } from '@google-cloud/pubsub'
import { WithSystemOperation } from '../common'

export const PUBSUB_INCOMING_MESSAGE_TOPIC = 'shio-incoming-message'
export const PUBSUB_FULLFILLMENT_SUBSCRIPTION = 'shio-fullfillment-service'

export async function RunCloudPubSubMigration(pubsub: PubSub) {
  const incomingMessageTopic = pubsub.topic(PUBSUB_INCOMING_MESSAGE_TOPIC)
  const incomingMessageSubscription = incomingMessageTopic.subscription(PUBSUB_FULLFILLMENT_SUBSCRIPTION)
  await Promise.all([incomingMessageTopic.get({ autoCreate: true }), incomingMessageSubscription.get({ autoCreate: true })])
  return {
    incomingMessageTopic,
    incomingMessageSubscription
  }
}

export async function RunDatastoreMigration(datastore: Datastore, acl: DatastoreACLRepository) {
  console.time('Run migrate operation')
  await Promise.all([
    acl.CreatePermission(SYSTEM_USER, newResourceTag('acl', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('user', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('asset', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('payment', '*'), Permission.OWNER, WithSystemOperation()),
    acl.CreatePermission(SYSTEM_USER, newResourceTag('transaction', '*'), Permission.OWNER, WithSystemOperation())
  ])
  console.timeEnd('Run migrate operation')
}
