import { Config } from "../app/config";
import { GetEnvStringOrThrow, GetEnvString } from "@shio/foundation";

export function LoadConfig(): Config {

  const option: Config = {
    projectId: GetEnvStringOrThrow('SHIO_FULFILLMENT_PROJECT_ID'),
    datastoreNamespace: GetEnvStringOrThrow("SHIO_FULFILLMENT_DATASTORE_NAMESPACE"),
  }
  if (GetEnvString("SHIO_FULFILLMENT_DATASTORE_LOCAL") === "1") {
    option.datastoreEndpoint = "http://localhost:5445"
  }

  if (GetEnvString("SHIO_FULFILLMENT_PUBSUB_LOCAL") === "1") {
    option.pubsubEndpoint = "http://localhost:8085"
  }

  return option

}