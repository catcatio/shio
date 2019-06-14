
import { MessageFulfillment, OutgoingMessage } from '@shio-bot/foundation/entities';
import { NarrowUnion } from '../app/endpoints/default';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchFulfillment: <Intent extends MessageFulfillment['name']>(name: Intent, assertFunction: (fulfillment: NarrowUnion<MessageFulfillment, Intent>) => void) => CustomMatcher;
    }
  }
}

expect.extend({
  toMatchFulfillment(message: OutgoingMessage, name: MessageFulfillment['name'], assertFn) {
    if (!message) {
      return {
        pass: false,
        message: () => `fulfillment expect ${name} but receive empty ${message}`
      }
    }

    if (message.fulfillment.length < 1) {
      return {
        message: () => `expect fulfillment ${name} receive no fulfillment`,
        pass: false
      }
    }
    let pass = true
    let reason = ""
    try {
      assertFn(message.fulfillment[0] as any)
    } catch (e) {
      pass = false
      reason = e.toString()
    }
    pass = pass && message.fulfillment[0].name === name
    if (!pass) {
      return {
        message: () => `fulfillment expect ${name} not match, receive ${message.fulfillment[0].name}\n${reason}\n${JSON.stringify(message, null, " ")}`,
        pass,
      }
    }
    return {
      message: () => "fulfillment match",
      pass
    }
  }
})