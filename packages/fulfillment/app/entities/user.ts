import { CommonAttributes } from "./common";
import { Asset } from "./asset";
import { MessageProvider } from "@shio/foundation/entities";



export interface UserProviders{
  lineId: string
}

export interface UserChatSession extends CommonAttributes {
  id: string
  userId: string
  sessionRefId?: string
  provider: MessageProvider
  providerId: string
  lastAccessed?: Date
}

export interface User extends CommonAttributes {
  id: string
  displayName: string
  aclTag: string
  stellarPublicKey?: string
  stellarEncryptedSecretKey?: string
}

export interface UserPurchased {
  userId: string
  transactionId: string
  assetId: string
  aclTag: string
  asset?: Asset
}