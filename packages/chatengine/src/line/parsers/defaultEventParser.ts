import { ParsedMessage } from "../../types";
import { getSource, lineProvider } from "../parsers";
import { EventParser, Event } from "./types";

const eventType = '*'

const handler: EventParser = (event: Event): ParsedMessage => {
  console.error('unhandled event', JSON.stringify(event))
  return {
    replyToken: event.replyToken,
    message: '',
    type: 'unknown',
    timestamp: event.timestamp,
    source: getSource(event.source),
    provider: lineProvider
  }
}

export = {
  eventType,
  handler
}
