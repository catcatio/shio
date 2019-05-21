import { EventEmitter } from 'events'

import { Request, Response, NextCallback, ParsedMessage, RequestHandler, MessageParser } from '../types'

export type OnMessageReceiveCallback = (message: ParsedMessage) => void

export class ChatEngine extends EventEmitter {
  private _onMessageReceiveEventName = 'messagereceived'

  onMessageReceived(cb: OnMessageReceiveCallback): void {
    this.on(this._onMessageReceiveEventName, cb)
  }

  constructor(private reqHandler: RequestHandler, private parser: MessageParser) {
    super()
  }

  middleware(req: Request, res: Response, next: NextCallback): any {
    try {
      // validate message
      let rawMsg = this.reqHandler.handle(req)
      // parse message
      let msgs = this.parser.parse(rawMsg)
      // notify listeners
      msgs.forEach(m => this.emit(this._onMessageReceiveEventName, m))

      next && next()
    } catch(err) {
      next && next(err)
    }
  }
}