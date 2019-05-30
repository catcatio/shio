export interface Config {
  projectId: string
  datastoreNamespace: string
  datastoreEndpoint?: string
  pubsubEndpoint?: string

  dev?: boolean
}
