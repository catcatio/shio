import { GetEnvStringOrThrow as GetEnvStringOrThrow, GetEnvString } from "@shio/foundation";

export interface Config {
  projectId: string
  datastoreNamespace: string
  datastoreEndpoint?: string

  pubsubEndpoint?: string
}
