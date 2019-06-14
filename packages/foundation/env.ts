import { platform } from "os";


export const getLocalhostUrl = () => {
  let host = 'http://localhost'
  if (platform() === 'darwin') {
    console.log('Setup subscription for darwin platform')
    host = 'http://host.docker.internal'
  } else {
    console.log('Setup subscription none darwin platform')
    host = 'http://localhost'
  }
  return host
}

export function GetEnvConfig() {
  const hostUrl = new URL(getLocalhostUrl())
  hostUrl.port = "8080"

  const isLocal = GetEnvString("SHIO_LOCAL", "1")

  let pubsubEndpoint: undefined | string
  let datastoreEndpoint: undefined | string
  if (isLocal === "1") {
    pubsubEndpoint = "http://localhost:8085"
    datastoreEndpoint = "http://localhost:5455"
  }


  return {
    projectId: GetEnvString("SHIO_PROJECT_ID", "catcat-development"),
    datastoreNamespace: GetEnvString("SHIO_DATASTORE_NAMESPACE", "shio-development"),
    bucketName: GetEnvString("SHIO_BUCKET_NAME", "shio-development"),
    port: GetEnvString("SHIO_PORT", "8080"),
    host: GetEnvString("SHIO_HOST", hostUrl.port),
    pubsubEndpoint,
    datastoreEndpoint
  }

}

export function GetEnvString(key: string, defaultValue?: string) {
  const value = process.env[key] || defaultValue || ""

  if (value === "") {
    return defaultValue || ""
  }

  return value
}

export function GetEnvStringOrThrow(key: string, description: string = "") {
  const value = GetEnvString(key)
  if (value === "") {
    throw new Error(`Environment variable ${key} does not exists.... ${description}`)
  }
  return value
}