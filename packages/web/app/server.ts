import * as express from 'express'
import { Configurations, Endpoint } from './types'

export const server = (config: Configurations, ...endpoints: Endpoint[]) => {
  let app = express()
  app.use(express.json())

  endpoints.forEach(e => app.use(e.path, e))
  const start = async (): Promise<void> =>
    new Promise(resolve => {
      app.listen(config.port, () => {
        console.log(`started on ${config.port}`)
        resolve()
      })
    })

  app.get('/', (req, res) => {
    res.status(200).end(`ok - ${new Date()}`)
  })
  const addEndpoint = (endpoint: Endpoint) => {
    app.use(endpoint.path, endpoint)
  }

  return {
    start,
    addEndpoint
  }
}
