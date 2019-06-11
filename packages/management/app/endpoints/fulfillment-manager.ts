import { CreateBookAssetOutput, CreateBookAssetInput, ListBookAssetOutput, ListBookAssetInput } from "../../__generated__/fulfillment_pb";
import { FulfillmentManagerUseCase } from "../usecase/fulfillment";
import { newLogger, createStreamTransport } from "@shio-bot/foundation";
import { Writable } from "stream";
import { handleServerStreamingCall, handleUnaryCall } from "grpc";


export class FulfillmentManager {

  private fulfillment: FulfillmentManagerUseCase
  constructor(fulfillment: FulfillmentManagerUseCase) {
    this.fulfillment = fulfillment
  }

  listBookAsset: handleUnaryCall<ListBookAssetInput, ListBookAssetOutput> = (input, cb) => {
    this.fulfillment.listBookAsset(input.request).then(output => {
      cb(null, output)
    }).catch(err => {
      cb(err, new ListBookAssetOutput())
    })
  }

  createBookAsset: handleServerStreamingCall<CreateBookAssetInput, CreateBookAssetOutput> = (call) => {

    // Stream log from server
    // to client SDK
    const stream = new Writable()
    stream._write = (chunck: Buffer, encoding, done) => {
      const data = new CreateBookAssetOutput()
      data.setMessage(chunck.toString())
      call.write(data, done)
    }
    
    // perform operation and end on complete
    const log = newLogger([createStreamTransport(stream)])
    this.fulfillment.createBookAsset(call.request, log).then((result) => {
      const data = new CreateBookAssetOutput()
      data.setId(data.getId())
      data.setMessage("create book done!")
      call.write(data, () => {
        call.end()
      })
    })
  }

}