import { LineSettings } from "@shio-bot/chatengine/types";

export type Configurations = {
  port: number
  chatEngine: ChatEngineSettings
}

export type ChatEngineSettings = {
  line: LineSettings
  dialogflow: any
}
