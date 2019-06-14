import * as express from 'express'
import * as bodyParser from 'body-parser'
import { FulfillmentConnector } from './helpers/fullfillment-connector';
import { MessageProvider, WhoMessageFulfillment } from '@shio-bot/foundation/entities';
import * as next from 'next'
import config from '../next.config'
import { UnauthorizedError } from '../common/error';
import { createSessionMiddleware } from './middlewares/session';
import { GetProfilePath, GetBookDetailPath } from '../common/service-connector';



function isRequestWithUserOrThrow(req: express.Request): req is express.Request & { user: WhoMessageFulfillment['parameters'] } {
  if (req['user'] && req['user']['userId'] && req['user']['provider']) {
    return true
  }
  throw UnauthorizedError
}




export async function bootstrap(fulfillmentEndpointUrl: string, port: number, host: string) {
  const fulfillment = new FulfillmentConnector(fulfillmentEndpointUrl)
  const app = express()
  const sessionMiddleware = createSessionMiddleware(fulfillment)

  const APIRouter = express.Router()
  APIRouter.use(sessionMiddleware)
  APIRouter.use(bodyParser.json())

  APIRouter.get(GetBookDetailPath, (req, res) => {
    if (isRequestWithUserOrThrow(req)) {

    }
  })
  APIRouter.get(GetProfilePath, (req, res) => {
    if (isRequestWithUserOrThrow(req)) {
      res.json(req.user)
    }
  })


  const view = next({
    dev: process.env['NODE_ENV'] === 'development',
    conf: config,
  })

  await view.prepare()

  app.use('/api', APIRouter)

  const loopbackUrl = new URL('http://localhost/api')
  loopbackUrl.port = port + ""

  const hostUrl = new URL(host)
  hostUrl.pathname = 'api'

  function getViewQueryStringAttribute(req: express.Request) {
    if (isRequestWithUserOrThrow(req)) {
      return {
        provider: req.user.provider,
        providerUserId: req.user.providerId,
        loopbackUrl: loopbackUrl.href,
        hostUrl: hostUrl.href
      }
    }
  }

  app.get('/view/profile', sessionMiddleware, (req, res) => {
    if (isRequestWithUserOrThrow(req)) {
      view.render(req, res, '/profile', getViewQueryStringAttribute(req))
    }
  })

  app.all('*', (req, res) => {
    if (req.headers['content-type'] !== 'application/json') {
      view.handleRequest(req, res)
    } else {
      res.status(404).json({ message: "no content" }).end()
    }
  })

  app.listen(port)
}