import { getSource, lineProvider } from "../parsers";
import { ParsedMessage } from "../../types";
import { EventParser, Event } from "./types";

const eventType = 'follow'

/**
 {
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "type": "follow",
  "timestamp": 1462629479859,
  "source": {
    "type": "user",
    "userId": "U4af4980629..."
  }
}
 */

const handler: EventParser = (event: Event): ParsedMessage => {
  console.log(eventType, event)
  return {
    replyToken: event.replyToken,
    message: '',
    type: eventType,
    timestamp: event.timestamp,
    source: getSource(event.source),
    provider: lineProvider
  }
}

export = {
  handler,
  eventType
}