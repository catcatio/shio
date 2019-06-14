export interface Config {
  host: string,
  projectId: string
  datastoreNamespace: string
  datastoreEndpoint?: string
  pubsubEndpoint?: string
  bucketName: string
  port: string,  
  dev?: boolean
}
