import { Server, ServerCredentials } from "grpc";
import { GCPFileStorage, createDatastoreInstance, WithDatastoreNameSpace, GetEnvString, WithDatastoreProjectId } from "@shio-bot/foundation";
import { DatastoreAssetRepository } from "../../fulfillment/app";
import { FulfillmentManager } from "./endpoints/fulfillment-manager";
import { FulfillmentManagerService } from "../__generated__/fulfillment_grpc_pb";
import { FulfillmentManagerUseCase } from "./usecase/fulfillment";

async function createComponent(projectId: string) {
  console.log("ProjectID: "+ projectId)

  const storage = new GCPFileStorage(projectId)
  const datastore = await createDatastoreInstance(
    WithDatastoreNameSpace('fulfillment'),
    WithDatastoreProjectId(projectId),
  )
  const assetRepository = new DatastoreAssetRepository(datastore)
  const fulfillmentUseCase = new FulfillmentManagerUseCase(assetRepository, storage)
  const fulfillmentManager = new FulfillmentManager(fulfillmentUseCase)

  return {
    storage,
    fulfillmentManager
  }
}
async function bootstrap() {
  const s = new Server()
  const { fulfillmentManager } = await createComponent(GetEnvString('SHIO_MANAGEMENT_PROJECT_ID', 'catcat-development'))
  s.addService(FulfillmentManagerService, fulfillmentManager)
  s.bind("0.0.0.0:9199", ServerCredentials.createInsecure())
  s.start()
  console.log("shio management start at :9199")
}

bootstrap()