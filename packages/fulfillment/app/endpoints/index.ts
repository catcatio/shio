import { BoardingUsecase } from "../usecases/boarding";
import { makeFollowEndpoint } from "./follow";
import { ListItemEventMessageIntentKind, FollowEventMessageIntentKind } from "../entities/asset";
import { makeListItemEndpoint } from "./list-item";
import { MerchandiseUseCase } from "../usecases/merchandise";

export type FulfillmentEndpoint = ReturnType<typeof createFulfillmentEndpoint>

export function createFulfillmentEndpoint(boarding: BoardingUsecase, merchandise: MerchandiseUseCase) {
  return {
    [FollowEventMessageIntentKind]: makeFollowEndpoint(boarding),
    [ListItemEventMessageIntentKind]: makeListItemEndpoint(merchandise),
  }
}