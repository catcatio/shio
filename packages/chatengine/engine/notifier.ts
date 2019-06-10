import { EventEmitter } from 'events'
import {
  ParsedMessage,
  OnMessageReceivedCallback,
  OnMessageReceivedEventName,
  OnPaymentConfirmationReceivedCallback,
  OnPaymentConfirmationReceivedEventName,
  PaymentConfirmationPayload,
  IParsedMessageNotifier,
  IPaymentNotifier,
  ConfirmTransaction
} from '../types'

export class ParsedMessageNotifier extends EventEmitter implements IParsedMessageNotifier {
  public onMessageReceived(cb: OnMessageReceivedCallback): void {
    this.on(OnMessageReceivedEventName, cb)
  }

  public notify(msg: ParsedMessage): void {
    this.emit(OnMessageReceivedEventName, msg)
  }
}

export class PaymentNotifier extends EventEmitter implements IPaymentNotifier {
  public onPaymentConfirmationReceived(cb: OnPaymentConfirmationReceivedCallback): void {
    this.on(OnPaymentConfirmationReceivedEventName, cb)
  }

  public notify(payload: PaymentConfirmationPayload, cb: ConfirmTransaction): void {
    this.emit(OnPaymentConfirmationReceivedEventName, payload, cb)
  }
}
