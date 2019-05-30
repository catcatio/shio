import { ParsedMessage } from '../../types'
import { getSource, lineProvider } from '../parsers'
import { EventParser, Event } from './types'

const eventType = 'beacon'

/*{
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "type": "beacon",
  "timestamp": 1462629479859,
  "source": {
    "type": "user",
    "userId": "U4af4980629..."
  },
  "beacon": {
    "hwid": "d41d8cd98f",
    "type": "enter"
  }
}*/

const handler: EventParser = (event: Event): ParsedMessage => {
  console.log(eventType, event)
  return {
    replyToken: event.replyToken,
    message: event.beacon,
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
