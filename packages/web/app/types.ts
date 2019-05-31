import { LineSettings } from '@shio-bot/chatengine/types'

export type Configurations = {
  serviceName: string
  port: number
  chatEngine: ChatEngineSettings
  pubsub: any
}

export type ChatEngineSettings = {
  line: LineSettings
  dialogflow: any
}
