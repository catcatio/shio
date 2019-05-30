import { MessagingClient, LineMessageClientSendImageInput, LineMessageClientSendImageOutput, LineMessageClientSendMessageInput, LineMessageClientSendMessageOutput, LineMessageClientSendCustomMessagesInput, LineMessageClientSendCustomMessagesOutput, LineMessageClientGetProfileInput, LineMessageClientGetProfileOutput, LineSettings, LineConfig } from '../types'
import { Client as LineClient, ImageMessage, Message, TextMessage, HTTPError } from "@line/bot-sdk";

const defaultApiEndpoint: string = 'https://api.line.me/v2/bot/'
export class LineMessagingClient implements MessagingClient {
  private apiEndPoint: string
  private lineConfig: LineConfig
  private lineClient: LineClient

  constructor(settings: LineSettings) {
    this.lineConfig = settings.clientConfig
    if (!this.lineConfig.channelAccessToken) {
      throw new Error('no channel access token')
    }

    this.apiEndPoint = settings.apiEndPoint || defaultApiEndpoint

    this.lineClient = new LineClient(this.lineConfig)
  }

  private isInvalidTokenError(err: HTTPError): boolean {
    console.log(err instanceof HTTPError)
    return err.originalError
      && err.originalError.response
      && err.originalError.response.data
      && err.originalError.response.data.message === 'Invalid reply token'
  }

  private async tryReplyAndPush(replyToken: string, to: string | string[], messages: Message | Message[]): Promise<any> {
    if (Array.isArray(to)) {
      return this.lineClient.multicast(to, messages)
    }

    if (replyToken) {
      return await this.lineClient.replyMessage(replyToken, messages)
        .catch(err => {
          if (this.isInvalidTokenError(err)) {
            return this.lineClient.pushMessage(to, messages)
          }
          throw err
        })
    } else {
      return this.lineClient.pushMessage(to, messages)
    }
  }

  async sendImage(input: LineMessageClientSendImageInput): Promise<LineMessageClientSendImageOutput> {
    let msgs: any[] = [{
      'type': 'image',
      'originalContentUrl': input.imageUrl,
      'previewImageUrl': input.thumbnailUrl
    }]

    if (input.textMessage) {
      msgs.push({ 'type': 'text', 'text': input.textMessage, })
    }


    await this.tryReplyAndPush(input.replyToken, input.to, msgs)

    return {
      provider: 'line',
      success: true,
    }
  }

  async sendMessage(input: LineMessageClientSendMessageInput): Promise<LineMessageClientSendMessageOutput> {
    let msgs: TextMessage[] = Array.isArray(input.text)
      ? input.text.map(t => ({ 'type': 'text', 'text': t, }))
      : [{ 'type': 'text', 'text': input.text, }]

    await this.tryReplyAndPush(input.replyToken, input.to, msgs)

    return {
      provider: 'line',
      success: true,
    }
  }

  async sendCustomMessages(input: LineMessageClientSendCustomMessagesInput): Promise<LineMessageClientSendCustomMessagesOutput> {
    let msgs: Message[] = Array.isArray(input.message)
      ? input.message
      : [input.message]

    await this.tryReplyAndPush(input.replyToken, input.provider, msgs)

    return {
      provider: 'line'
    }
  }

  async getProfile(input: LineMessageClientGetProfileInput): Promise<LineMessageClientGetProfileOutput> {
    return {
      provider: 'line'
    }
  }
}