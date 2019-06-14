import { MessageProvider } from "@shio-bot/foundation/entities";

export function isMessageProvider(value: any): MessageProvider | null {
  if (value === 'line' || value === 'facebook') {
    return value
  }
}