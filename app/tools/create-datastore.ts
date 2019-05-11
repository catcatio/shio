import { Datastore } from "@google-cloud/datastore";

export function CreateDatastoreInstance(apiEndpoint?: string) {
  const datastore = new Datastore({
    apiEndpoint,
    namespace: "catcat",
    projectId: "catcat-development" 
  })
  console.info(`Connection datastore at: ${apiEndpoint || datastore.baseUrl_}`)
  return datastore
}