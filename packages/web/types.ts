import { LineSettings } from "@shio/chatengine/types";

export type Configurations = {
  port: number
  chatEngine: ChatEngineSettings
}

export type ChatEngineSettings = {
  line: LineSettings
  dialogflow: any
}
