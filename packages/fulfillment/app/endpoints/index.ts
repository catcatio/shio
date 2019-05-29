import { BoardingUsecase } from "../usecases/boarding";
import { makeFollowEndpoint } from "./follow";

export type FulfillmentEndpoint = ReturnType<typeof createFulfillmentEndpoint>

export function createFulfillmentEndpoint(boarding: BoardingUsecase) {
  return {
    follow: makeFollowEndpoint(boarding),
  }
}