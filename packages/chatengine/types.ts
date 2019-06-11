import { Entity } from 'dialogflow'

export type MessageType =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'audioMessage'
  | 'fileMessage'
  | 'locationMessage'
  | 'stickerMessage'
  | 'follow'
  | 'unfollow'
  | 'postback'
  | 'join'
  | 'leave'
  | 'postback'
  | 'beacon'
  | 'accountLink'
  | 'unknown'

export type ParsedMessage = {
  message?: string | object
  type: MessageType
  replyToken: string
  timestamp: number
  source: Source
  provider: string
  original?: any
}

export type UserInfo = {
  id: string
  displayName: string
  pictureUrl?: string
}

export type empty = null | undefined

export type Source = User | Room | Group

export type User = {
  userId: string
  type: 'user'
}

export type Room = {
  userId: string
  roomId: string
  type: 'room'
}

export type Group = {
  userId: string
  groupId: string
  type: 'group'
}

export interface MessageParser {
  parse(rawMsg: any): ParsedMessage[]
}

export interface MessagerResponder {
  send(to: string, ...messages: string[]): boolean
}

export interface Intent {
  name: string
  parameters: IntentParameters
}

export type IntentParameters = {
  [name: string]: any
}

export interface IntentDetector {
  name: string
  isSupport(msgType: MessageType): boolean
  detect(message: ParsedMessage): Promise<Intent | empty>
}

export interface Provider<T> {
  add(intent: T): void
  get(name: string): T
}

export interface IntentDetectorProvider extends Provider<IntentDetector> {}
export interface MessagingClientProvider extends Provider<MessagingClient> {}
export interface PaymentClientProvider extends Provider<PaymentClient> {}

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
  success: boolean
}

export interface LineMessageClientGetProfileInput {
  provider: 'line'
  userId: string
}

export interface LineMessageClientGetProfileOutput {
  provider: 'line'
  userId: string
  displayName: string
  pictureUrl?: string
}

export interface MessagingClient {
  name: string
  sendImage(input: MessageClientSendImageInput): Promise<MessageClientSendImageOutput>
  sendMessage(input: MessageClientSendMessageInput): Promise<MessageClientSendMessageOutput>
  sendCustomMessages(input: MessageClientSendCustomMessagesInput): Promise<MessageClientSendCustomMessagesOutput>
  getProfile(input: MessageClientGetProfileInput): Promise<MessageClientGetProfileOutput>
}

export interface Configuration {
  line?: LineSettings
  dialogflow?: DialogFlowSettings
  linepay?: LinePaySettings
  fluke?: FlukeSettings
}

export interface LineClientConfig {
  channelAccessToken: string
  channelSecret: string
  channelId: string
}

export type LineSettings = {
  clientConfig: LineClientConfig
  sendToConsole?: boolean
  routerPath?: string
}

export type DialogFlowSettings = {
  credentials: {
    client_email: string
    private_key: string
  }
  projectId: string
}

export type LinePaySettings = {
  clientConfig: {
    channelId: string
    channelSecret: string
    isSandbox: boolean
  }
  // apiEndpoint: string
  confirmUrl: string
  routerPath?: string
}

export type IntentFunc = (msg: string) => Intent

export type FlukeSettings = {
  intentMap?: { [msg: string]: Intent | IntentFunc }
}

export type GoogleServiceAccountKey = {
  credentials: {
    client_email: string
    private_key: string
  }
  projectId: string
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

export const OnMessageReceivedEventName = 'MessageReceived'
export const OnPaymentConfirmationReceivedEventName = 'PaymentConfirmationReceived'

export type OnMessageReceivedCallback = (message: ParsedMessage) => void

export type ConfirmTransaction = (confirmRequest: PaymentConfirmRequest, error: Error) => Promise<PaymentConfirmResponse>

export type OnPaymentConfirmationReceivedCallback = (payload: PaymentConfirmationPayload, confirmTransaction: ConfirmTransaction) => Promise<any>

export interface IParsedMessageNotifier {
  onMessageReceived(cb: OnMessageReceivedCallback): void
  notify(msg: ParsedMessage): void
}

export interface IPaymentNotifier {
  onPaymentConfirmationReceived(cb: OnPaymentConfirmationReceivedCallback): void
  notify(payload: PaymentConfirmationPayload, cb: ConfirmTransaction): void
}

export type PaymentConfirmationPayload = LinepayPaymentConfirmationPayload

export type PaymentConfirmRequest = LineMessageConfirmRequest

export type PaymentConfirmResponse = {}

export interface LineMessageConfirmRequest {
  transactionId: string
  amount: number
  currency: string
}

export interface LinepayPaymentConfirmationPayload {
  provider: 'linepay'
  transactionId: string
  orderId: string
}

export type ReservePaymentRequest = LineReservePaymentRequest
export type ReservePaymentResponse = LineReservePaymentResponse

export interface LineReservePaymentRequest {
  productName: string
  productImageUrl?: string
  amount: number
  currency: string
  mid?: string // line member id
  oneTimeKey?: string
  confirmUrl: string
  confirmUrlType?: 'SERVER' | 'CLIENT'
  checkConfirmUrlBrowswer?: boolean
  cancelUrl?: string
  packageName?: string
  orderId: string
  deliveryPlacePhone?: string
  payType?: 'NORMAL' | 'PREAPPROVED'
  langCd?: string
  capture?: boolean
}

export interface LineReservePaymentResponseInfo {
  transactionId: string
  paymentAccessToken: string
}
export interface LineReservePaymentResponse {
  returnCode: string
  returnMessage: string
  info: LineReservePaymentResponseInfo
  transactionId: string
}

export interface PaymentClient {
  name: string
  reserve(request: ReservePaymentRequest): Promise<ReservePaymentResponse>
}
