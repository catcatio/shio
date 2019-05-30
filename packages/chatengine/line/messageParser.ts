import { ParsedMessage, MessageParser } from '../types'
import eventParser from './parsers'

export class LineMessageParser implements MessageParser {
  parse(rawMsg: any): ParsedMessage[] {
    let events = [].concat.apply([], rawMsg.events)

    let msgs: ParsedMessage[] = events.map((e: any) => {
      return eventParser(e)
    })
    return msgs
  }
}
