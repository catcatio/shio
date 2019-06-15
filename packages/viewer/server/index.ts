import * as express from 'express'
import * as bodyParser from 'body-parser'
import { FulfillmentConnector } from './helpers/fullfillment-connector';
import { WhoMessageFulfillment } from '@shio-bot/foundation/entities';
import * as next from 'next'
import config from '../next.config'
import { UnauthorizedError } from '../common/error';
import { createSessionMiddleware } from './middlewares/session';
import { GetProfilePath, GetAssetDetailPath, ShioServiceConnectorCredential, ShioBaseInitialProps } from '../common/service-connector';



function isRequestWithUserOrThrow(req: express.Request): req is express.Request & { user: WhoMessageFulfillment['parameters'] } {
  if (req['user'] && req['user']['userId'] && req['user']['provider']) {
    return true
  }
  throw UnauthorizedError
}


type handlerRequestWithUser = Parameters<express.Handler>[0] & { user: WhoMessageFulfillment['parameters'] }
type handlerResponse = Parameters<express.Handler>[1]
type handlerNext = Parameters<express.Handler>[2]
function routeHandlerWithUser(handle: (req: handlerRequestWithUser, res: handlerResponse, next: handlerNext) => ReturnType<express.Handler>): express.Handler {
  return async (req, res, next) => {
    if (isRequestWithUserOrThrow(req)) {
      try {
        await handle(req, res, next)
      } catch (e) {
        res.status(500).send(e)
      }
    }
  }
}




export async function bootstrap(fulfillmentEndpointUrl: string, port: number | string, host: string) {
  const fulfillment = new FulfillmentConnector(fulfillmentEndpointUrl)
  const app = express()
  const sessionMiddleware = createSessionMiddleware(fulfillment)

  const APIRouter = express.Router()
  APIRouter.use(sessionMiddleware)
  APIRouter.use(bodyParser.json())

  APIRouter.get(GetAssetDetailPath, routeHandlerWithUser(async (req, res) => {
    const assetId = req.query['assetId']
    if (typeof assetId !== 'string') {
      return res.status(400).json({ message: "asset id not found" })
    }
    const asset = await fulfillment.getAsset(req.user.provider, req.user.providerId, assetId)
    if (!asset) {
      return res.status(404).json({ message: "asset not found" })
    }

    const download = await fulfillment.getAssetDownloadableUrl(req.user.provider, req.user.providerId, assetId)

    return res.json({
      data: {
        meta: asset.parameters,
        download: download.paramters,
      },
      path: GetAssetDetailPath
    })
  }))

  APIRouter.get(GetProfilePath, routeHandlerWithUser((req, res) => {
    res.json({
      data: req.user,
      path: GetProfilePath
    })
  }))


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

  function getInitialPropsFromServer(req: express.Request): ShioBaseInitialProps {
    return {
      loopbackUrl: loopbackUrl.href,
      hostUrl: hostUrl.href,
      lineSDK: 'https://d.line-scdn.net/liff/1.0/sdk.js',
      provider: req.query['provider'],
      ...req.query,
    }
  }

  app.get('/view/profile', (req, res) => {
    const initProps = getInitialPropsFromServer(req)
    view.render(req, res, '/profile', {
      ...initProps
    })
  })

  app.get('/view/asset', (req, res) => {
    const initProps = getInitialPropsFromServer(req)
    view.render(req, res, '/asset', { ...initProps })
  })

  app.get('/view/line-liff-entry', (req, res) => {
    const initProps = getInitialPropsFromServer(req)
    initProps.provider = 'line'
    view.render(req, res, '/line-liff-entry', {
      ...initProps,
      ...req.query
    })
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