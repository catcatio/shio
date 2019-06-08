import { Datastore, DatastoreOptions } from "@google-cloud/datastore";
import { FunctionOption, composeFunctionOptions } from "../type-utilities";

type ShioDatastoreOption = FunctionOption<DatastoreOptions>
export function WithDatastoreAPIEndpoint(apiEndpoint: string): FunctionOption<DatastoreOptions> {
  return (option) => {
    option.apiEndpoint = apiEndpoint
    return option
  }
}

export const WithDatastoreNameSpace = (namespace: string):ShioDatastoreOption => (option) => {
  option.namespace = namespace
  return option
}

export const WithDatastoreProjectId = (projectId: string): ShioDatastoreOption => (option) => {
  option.projectId = projectId
  return option
}

export async function createDatastoreInstance(...options: ShioDatastoreOption[]) {

  const option: DatastoreOptions = composeFunctionOptions({
    namespace: "catcat",
  }, ...options)

  console.info(`try to connect datastore... ${option.apiEndpoint ? option.apiEndpoint : ""}`)
  const datastore = new Datastore({
    ...option,
  })

  // Run some query to make sure database is up
  const k = datastore.key(["_ping"])
  await datastore.insert({
    key: k,
    data: {
      ping: 'pong'
    }
  })

  console.info("Datastore connected!!")
  return datastore
}


