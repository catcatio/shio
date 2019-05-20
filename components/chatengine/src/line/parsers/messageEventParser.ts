import { MessageType, ParsedMessage } from "../../types";
import { getSource, lineProvider } from "../parsers";
import { EventParser, Event } from "./types";

const eventType = 'message'
/**
{
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "type": "message",
  "timestamp": 1462629479859,
  "source": {
    "type": "user",
    "userId": "U4af4980629..."
  },
  "message": {
    "id": "325708",
    "type": "text",
    "text": "Hello, world!"
  }
}
*/

/*
- message types
  text
  image
  video
  audio
  file
  location
  sticker
*/

const handler: EventParser = (event: Event): ParsedMessage => {

  let type = `${event.message.type}Message`
  let message = event.message.type === 'text'
    ? event.message.text
    : event.message

  console.log(type, event)
  return {
    replyToken: event.replyToken,
    message,
    type: type as MessageType,
    timestamp: event.timestamp,
    source: getSource(event.source),
    provider: lineProvider
  }
}

export = {
  handler,
  eventType
}