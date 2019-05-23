import { ParsedMessage } from "../../types";
import { getSource, lineProvider } from "../parsers";
import { EventParser, Event } from "./types";

const eventType = 'unfollow'

/**
{
  "type": "unfollow",
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
    replyToken: '', // no reply token
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