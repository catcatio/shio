import * as express from 'express'
import { validate, object, string, any } from 'joi';
import { GetItemDownloadUrlEventMessageIntentSchema, GetItemDownloadUrlEventMessageFulfillmentKind, validateMessageIntent, MessageProvider } from '../entities/asset';
import { FulfillmentEndpoint } from '../endpoints';
const nanoid = require('nanoid')

export function registerHttpTransports(http: express.Application, endpoints: FulfillmentEndpoint) {


  http.get('/internal/:intentName', async (req, res) => {
    const intent = {
      name: req.params['intentName'],
      parameters: {
        ...req.query
      }
    }
    const { value, error } = validateMessageIntent(intent)
    if (error) {
      res.status(400).send(error.message).end()
      return
    }

    const authInfo = string()
      .required()
      .regex(/^(line|facebook)\s.*$/)
      .error(new Error('header authorization format invalid'))
      .validate(
        req.headers['authorization'],
      )
    if (authInfo.error) {
      res.status(400).send(authInfo.error.message)
      return
    }

    const [provider, providerId] = authInfo.value!.split(' ')

    const requestId = req.headers['x-request-id']
    const output = await endpoints[value.name]({
      intent: value,
      languageCode: 'th',
      original: "",
      provider: provider as MessageProvider,
      requestId: typeof  requestId  === 'string' ? requestId : nanoid(5),
      source: {
        type: 'user',
        userId: providerId
      },
      type: 'textMessage',
      timestamp: Date.now(),
      userProfile: {
        displayName: providerId,
        userId: providerId
      }
    })

    res.json(output).status(200).end()
  })


}