import { getSource, lineProvider } from '../parsers'
import { ParsedMessage } from '../../types'
import { EventParser, Event } from './types'

const eventType = 'postback'

/**
{
   "type":"postback",
   "replyToken":"b60d432864f44d079f6d8efe86cf404b",
   "source":{
      "userId":"U91eeaf62d...",
      "type":"user"
   },
   "timestamp":1513669370317,
   "postback":{
      "data":"storeId=12345",
      "params":{
         "datetime":"2017-12-25T01:00"
      }
   }
}
 */

const handler: EventParser = (event: Event): ParsedMessage => {
  console.log(eventType, event)
  return {
    replyToken: event.replyToken,
    message: event.postback,
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
