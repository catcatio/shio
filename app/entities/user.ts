


export interface UserProviders{
  lineId: string
}

export interface UserChatSession {
  id: string
  session: string
  lastAccessed: Date
}

export interface User {
  displayName: string

  id: string
  providers:  UserProviders
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