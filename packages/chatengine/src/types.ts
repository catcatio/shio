import { Entity } from 'dialogflow';
import * as http from "http";

export type MessageType = 'textMessage' | 'imageMessage' | 'videoMessage' | 'audioMessage' | 'fileMessage' | 'locationMessage' | 'stickerMessage' |
  'follow' | 'unfollow' | 'postback' | 'join' | 'leave' | 'postback' | 'beacon' | 'accountLink' | 'unknown'

export type Request = http.IncomingMessage & { body: any };
export type Response = http.ServerResponse;
export type NextCallback = (err?: Error) => void;

export type ParsedMessage = {
  message?: string | object,
  type: MessageType,
  replyToken: string,
  timestamp: number,
  source: Source,
  provider: string,
}

export type empty = null | undefined

export type Source = User | Room | Group | empty

export type User = {
  userId: string,
  type: 'user'
}

export type Room = {
  userId: string,
  roomId: string,
  type: 'room'
}

export type Group = {
  userId: string,
  groupId: string,
  type: 'group'
}

export interface ConfigurationManager {
  GetConfig(key: string): any
}

export interface MessageParser {
  parse(rawMsg: any): ParsedMessage[]
}

export interface MessagerResponder {
  send(to: string, ...messages: string[]): boolean
}

export interface RequestHandler {
  handle(req: Request): any
}

export type Intent = {
  name: string,
  parameters: IntentParameters,
}

export type IntentParameters = {
  [name: string]: string
}

export interface EntityType {
  name?: string
  id: string
  kind: string
  entities: Entity[]
}

export interface ExportedAgent {
  agentContent: Buffer
}

export interface IntentDetector {
  IsSupport(msgType: MessageType): boolean
  detect(message: ParsedMessage): Promise<(Intent | empty)>
}