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
  original?: any,
}

export type empty = null | undefined

export type Source = User | Room | Group

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

export interface IntentDetector {
  isSupport(msgType: MessageType): boolean
  detect(message: ParsedMessage): Promise<(Intent | empty)>
}

// export type MessagingClient = ILineMessagingClient

export type MessageClientSendImageInput = LineMessageClientSendImageInput
export type MessageClientSendImageOutput = LineMessageClientSendImageOutput
export type MessageClientSendMessageInput = LineMessageClientSendMessageInput
export type MessageClientSendMessageOutput = LineMessageClientSendMessageOutput
export type MessageClientSendCustomMessagesInput = LineMessageClientSendCustomMessagesInput
export type MessageClientSendCustomMessagesOutput = LineMessageClientSendCustomMessagesOutput
export type MessageClientGetProfileInput = LineMessageClientGetProfileInput
export type MessageClientGetProfileOutput = LineMessageClientGetProfileOutput

export interface LineMessageClientSendImageInput {
  provider: 'line'
  replyToken: string
  to: string | string[]
  imageUrl: string
  thumbnailUrl: string
  textMessage?: string
}

export interface LineMessageClientSendImageOutput {
  provider: 'line'
  success: boolean
  message?: string
}

export interface LineMessageClientSendMessageInput {
  provider: 'line'
  replyToken: string
  to: string | string[]
  text: string | string[]
}

export interface LineMessageClientSendMessageOutput {
  provider: 'line'
  success: boolean
  message?: string
}

export interface LineMessageClientSendCustomMessagesInput {
  provider: 'line'
  replyToken: string
  to: string | string[]
  message: any | any[]
}

export interface LineMessageClientSendCustomMessagesOutput {
  provider: 'line'
}

export interface LineMessageClientGetProfileInput {
  provider: 'line'
}

export interface LineMessageClientGetProfileOutput {
  provider: 'line'
}

export interface MessagingClient {
  sendImage(input: MessageClientSendImageInput): Promise<MessageClientSendImageOutput>
  sendMessage(input: MessageClientSendMessageInput): Promise<MessageClientSendMessageOutput>
  sendCustomMessages(input: MessageClientSendCustomMessagesInput): Promise<MessageClientSendCustomMessagesOutput>
  getProfile(input: MessageClientGetProfileInput): Promise<MessageClientGetProfileOutput>
}

export interface LineConfig {
  channelAccessToken: string
  channelSecret: string
  channelId: string
}

export type LineSettings = {
  clientConfig: LineConfig,
  apiEndPoint?: string
}

export type LinePaySettings = {
  clientConfig: {
    channelId: string
    channelSecret: string
    isSandbox: boolean
  },
  apiEndpoint: string
  confirmUrl: string
}

export type ProvidersSettings = {
  line?: LineSettings,
  linePay?: LinePaySettings
}

export type Configurations = {
  providers: ProvidersSettings
  googleServiceAccountKey?: GoogleServiceAccountKey
}

export type GoogleServiceAccountKey = {
  credentials: {
    client_email: string
    private_key: string
  },
  apiKey: string
  projectId: string
}