


interface UserProviders{
  lineId: string
}

interface UserChatSession {
  id: string
  session: string
  lastAccessed: Date
}

interface User {
  displayName: string

  id: string
  providers:  UserProviders
  stellarPublicKey: string
  stellarEncryptedSecretKey: string
  aclTag: string
}

interface UserPurchased {
  userId: string
  transactionId: string
  assetId: string
  aclTag: string

  asset?: Asset
}