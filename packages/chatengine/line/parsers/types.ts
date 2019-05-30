import { ParsedMessage } from "../../types";

export type EventParser = (event: any) => ParsedMessage

export type EventParsers = {
  [key: string]: EventParser
}

export type Event = {
  replyToken: string,
  type: string,
  source: any,
  timestamp: number,

  message: any,
  beacon: any,
  postback: any,
}