import {
  MessagingClient,
  LineMessageClientSendImageInput,
  LineMessageClientSendImageOutput,
  LineMessageClientSendMessageInput,
  LineMessageClientSendMessageOutput,
  LineMessageClientSendCustomMessagesInput,
  LineMessageClientSendCustomMessagesOutput,
  LineMessageClientGetProfileInput,
  LineMessageClientGetProfileOutput,
  LineSettings,
  LineClientConfig
} from '../types'
import { Client as LineClient, ImageMessage, Message, TextMessage, HTTPError } from '@line/bot-sdk'

type sendFunc = (replyToken: string, to: string | string[], messages: Message | Message[]) => Promise<any>

export class LineMessagingClient implements MessagingClient {
  name = 'line'

  private lineConfig: LineClientConfig
  private lineClient: LineClient
  private send: sendFunc

  constructor(private settings: LineSettings) {
    this.lineConfig = settings.clientConfig

    if (!this.lineConfig.channelAccessToken) {
      throw new Error('no channel access token')
    }

    this.lineClient = new LineClient(this.lineConfig)
    this.send = settings.sendToConsole ? this.sendToConsole : this.tryReplyAndPush
  }

  private isInvalidTokenError(err: HTTPError): boolean {
    return err.originalError && err.originalError.response && err.originalError.response.data && err.originalError.response.data.message === 'Invalid reply token'
  }

  private async tryReplyAndPush(replyToken: string, to: string | string[], messages: Message | Message[]): Promise<any> {
    if (Array.isArray(to)) {
      return this.lineClient.multicast(to, messages)
    }

    if (replyToken) {
      return await this.lineClient.replyMessage(replyToken, messages).catch(err => {
        if (this.isInvalidTokenError(err)) {
          return this.lineClient.pushMessage(to, messages)
        }
        throw err
      })
    } else {
      return this.lineClient.pushMessage(to, messages)
    }
  }

  private async sendToConsole(replyToken: string, to: string | string[], messages: Message | Message[]): Promise<any> {
    console.log(
      'sendToConsole',
      JSON.stringify({
        replyToken,
        to,
        messages
      })
    )
  }

  async sendImage(input: LineMessageClientSendImageInput): Promise<LineMessageClientSendImageOutput> {
    let msgs: any[] = [
      {
        type: 'image',
        originalContentUrl: input.imageUrl,
        previewImageUrl: input.thumbnailUrl
      }
    ]

    if (input.textMessage) {
      msgs.push({ type: 'text', text: input.textMessage })
    }

    await this.send(input.replyToken, input.to, msgs)

    return {
      provider: 'line',
      success: true
    }
  }

  async sendMessage(input: LineMessageClientSendMessageInput): Promise<LineMessageClientSendMessageOutput> {
    let msgs: TextMessage[] = Array.isArray(input.text) ? input.text.map(t => ({ type: 'text', text: t })) : [{ type: 'text', text: input.text }]

    await this.send(input.replyToken, input.to, msgs)

    return {
      provider: 'line',
      success: true
    }
  }

  async sendCustomMessages(input: LineMessageClientSendCustomMessagesInput): Promise<LineMessageClientSendCustomMessagesOutput> {
    let msgs: Message[] = Array.isArray(input.message) ? input.message : [input.message]

    await this.send(input.replyToken, input.provider, msgs)

    return {
      provider: 'line',
      success: true
    }
  }

  async getProfile(input: LineMessageClientGetProfileInput): Promise<LineMessageClientGetProfileOutput> {
    if (this.settings.sendToConsole) {
      return {
        provider: 'line',
        userId: input.userId,
        displayName: `i am ${input.userId}`
      }
    }

    let profile = await this.lineClient.getProfile(input.userId)

    return {
      provider: 'line',
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl
    }
  }
}
