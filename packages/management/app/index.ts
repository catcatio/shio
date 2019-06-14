import { Server, ServerCredentials } from "grpc";
import { GCPFileStorage, createDatastoreInstance, WithDatastoreNameSpace, GetEnvString, WithDatastoreProjectId, newLogger, GetEnvConfig } from "@shio-bot/foundation";
import { DatastoreAssetRepository } from "../../fulfillment/app";
import { FulfillmentManager } from "./endpoints/fulfillment-manager";
import { FulfillmentManagerService } from "../__generated__/fulfillment_grpc_pb";
import { FulfillmentManagerUseCase } from "./usecase/fulfillment";
import { createGCPFileStorage } from "@shio-bot/foundation/storage/gcp";

const log = newLogger()
async function createComponent(projectId: string, datastoreNamespace: string, storageName: string) {

  log.info("ProjectID: " + projectId)
  log.info("Datastore namespace: " + datastoreNamespace)
  log.info("Storage name: " + storageName)

  const storage = await createGCPFileStorage(storageName)
  const datastore = await createDatastoreInstance(
    WithDatastoreNameSpace(datastoreNamespace),
    WithDatastoreProjectId(projectId),
  )
  const assetRepository = new DatastoreAssetRepository(datastore, storage)
  const fulfillmentUseCase = new FulfillmentManagerUseCase(assetRepository, storage)
  const fulfillmentManager = new FulfillmentManager(fulfillmentUseCase)

  return {
    storage,
    fulfillmentManager
  }
}
async function bootstrap() {
  const s = new Server()
  const defaultConstant = GetEnvConfig()

  const { fulfillmentManager } = await createComponent(
    GetEnvString('SHIO_MANAGEMENT_PROJECT_ID', defaultConstant.projectId),
    GetEnvString('SHIO_MANAGEMENT_DATASTORE_NAMESPACE', defaultConstant.datastoreNamespace),
    GetEnvString('SHIO_MANAGEMENT_STORAGE_NAME', defaultConstant.bucketName)
  )
  s.addService(FulfillmentManagerService, fulfillmentManager)
  s.bind("0.0.0.0:9199", ServerCredentials.createInsecure())
  s.start()
  log.info("shio management start at :9199")
}

bootstrap()
