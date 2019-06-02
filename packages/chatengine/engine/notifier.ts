import { EventEmitter } from 'events'
import { ParsedMessage, OnMessageReceivedCallback, OnMessageReceivedEventName } from '../types'

export class ParsedMessageNotifier extends EventEmitter {
  public onMessageReceived(cb: OnMessageReceivedCallback): void {
    this.on(OnMessageReceivedEventName, cb)
  }

  public notify(msg: ParsedMessage): void {
    this.emit(OnMessageReceivedEventName, msg)
  }
}
