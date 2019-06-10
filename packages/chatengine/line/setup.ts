import { Router, Request, Response } from 'express'
import { LineSettings, IParsedMessageNotifier } from '../types'
import { requestHandler } from './requestHandler'
import { messageParser } from './messageParser'

export const setup = (router: Router, notifier: IParsedMessageNotifier, lineSettings: LineSettings) => {
  const handler = requestHandler(lineSettings.clientConfig.channelSecret)
  const parser = messageParser()

  const path = lineSettings.routerPath || '/line'

  router.post(path, (req: Request, res: Response) => {
    // validate message
    let rawMsg = handler(req)

    // parse message
    let msgs = parser.parse(rawMsg)

    // notify listeners
    msgs.forEach(m => notifier.notify(m))

    res.send('OK')
  })
}
