import { ListItemEventMessageIntentKind, createOutgoingFromIncomingMessage, ListItemEventMessageFulfillmentKind } from "../entities/asset";
import { MerchandiseUseCase } from "../usecases/merchandise";
import { createEndpointFunction, EndpointFuntion } from "./default";




export function makeListItemEndpoint(merchandise: MerchandiseUseCase): EndpointFuntion {

  return createEndpointFunction(ListItemEventMessageIntentKind, async message => {

    const { limit, offset } = message.intent.parameters
    const output = await merchandise.listItem(
      {
        userId: message.source.userId,
        limit: message.intent.parameters.limit,
        offset: message.intent.parameters.offset,
      }
    )

    return createOutgoingFromIncomingMessage(message, [
      {
        name: ListItemEventMessageFulfillmentKind,
        parameters: {
          assets: output.records,
          hasNext: false,
          hasPrev: false,
          limit,
          offset,
          merchantTitle: "Reed",
        },
      }
    ])



  })

}