import { ParsedMessage, Intent, IntentDetector } from "@shio/chatengine/types";

export const incomingMessageHandler = (intentDetector: IntentDetector) => {
  const handle = async (msg: ParsedMessage) => {
    // get intent
    let intent = intentDetector.isSupport(msg.type)
    ? await intentDetector.detect(msg)
    : await Promise.resolve({name:`type-${msg.type}`, parameters: {}} as Intent)

    // pub message
    console.log(JSON.stringify(intent, null, 2))
  }

  return {
    handle
  }
}