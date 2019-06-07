import { MerchandiseUseCase } from "../usecases/merchandise";
import { EndpointFuntion, createEndpointFunction } from "./default";
import { ListItemEventMessageIntentKind } from "../entities/asset";




export function makeListItemEndpoint(merchandise: MerchandiseUseCase): EndpointFuntion {

  return createEndpointFunction(ListItemEventMessageIntentKind, async message => {

    const output = await merchandise.listItem(
      {
        userId: message.source.userId,
      }
    )

  })

}