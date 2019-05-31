export interface Config {
  host: string,
  projectId: string
  datastoreNamespace: string
  datastoreEndpoint?: string
  pubsubEndpoint?: string
  port: string,  
  dev?: boolean
}
