import { isMessageProvider } from "../../common/type-guard";
import { FulfillmentConnector } from "../helpers/fullfillment-connector";
import { UnauthorizedError } from "../../common/error";

export function createSessionMiddleware(fulfillment: FulfillmentConnector) {
  return async (req, res, next) => {
    const provider = isMessageProvider(req.headers['x-provider'] || req.query.provider)
    if (!provider) {
      res.status(400).end('invalid provider')
      return
    }
    const providerUserId = req.headers['x-provider-user-id'] || req.query['provider.userId']

    if (typeof provider !== 'string' || typeof providerUserId !== 'string') {
      res.status(400).end('invalid headers')
      return
    }

    // perform basic header validate
    const user = await fulfillment.getUserProfile(provider, providerUserId)
    if (!user) {
      res.status(401).end('invalid credential info')
      return
    }
    req['user'] = user.parameters

    try {
      next()
    } catch (e) {
      if (e === UnauthorizedError) {
        res.status(401).end("UnauthorizedError")
      } else {
        // throw e
        res.status(500).send(e).end()
      }
    }
  }
}