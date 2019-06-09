import { Fulfillment } from "../../types";
import { IntentDetector, MessagingClientProvider, MessagingClient, LineMessageClientGetProfileOutput } from "@shio-bot/chatengine";
import { tryBypassMessage } from "../incomingHandler";
import { intentMessageHandler } from "..";
import { IncomingMessage, ListItemEventMessageIntentKind } from "@shio-bot/foundation/entities";



class MockFulfilment implements Fulfillment {
  onFulfillment(listener: import("../../types").FulfillmentListener): void {
    throw new Error("Method not implemented.");
  }
  publishIntent(msg: import("@shio-bot/foundation/entities").IncomingMessage): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
class MockIntentDetector implements IntentDetector {
  name: string;
  isSupport(msgType: import("@shio-bot/chatengine").MessageType): boolean {
    throw new Error("Method not implemented.");
  }
  detect(message: import("@shio-bot/chatengine").ParsedMessage): Promise<import("@shio-bot/chatengine").Intent | null | undefined> {
    throw new Error("Method not implemented.");
  }
}
class MockMessagingClient implements MessagingClient {
  name: string; sendImage(input: import("@shio-bot/chatengine").LineMessageClientSendImageInput): Promise<import("@shio-bot/chatengine").LineMessageClientSendImageOutput> {
    throw new Error("Method not implemented.");
  }
  sendMessage(input: import("@shio-bot/chatengine").LineMessageClientSendMessageInput): Promise<import("@shio-bot/chatengine").LineMessageClientSendMessageOutput> {
    throw new Error("Method not implemented.");
  }
  sendCustomMessages(input: import("@shio-bot/chatengine").LineMessageClientSendCustomMessagesInput): Promise<import("@shio-bot/chatengine").LineMessageClientSendCustomMessagesOutput> {
    throw new Error("Method not implemented.");
  }
  getProfile(input: import("@shio-bot/chatengine").LineMessageClientGetProfileInput): Promise<import("@shio-bot/chatengine").LineMessageClientGetProfileOutput> {
    throw new Error("Method not implemented.");
  }


}
class MockMessagingClientProvider implements MessagingClientProvider {
  add(intent: import("@shio-bot/chatengine").MessagingClient): void {
    throw new Error("Method not implemented.");
  }
  get(name: string): import("@shio-bot/chatengine").MessagingClient {
    throw new Error("Method not implemented.");
  }
}

describe('incoming handler test', () => {



  test('try bypass message', async () => {

    const result = tryBypassMessage(`shio bypass list-item "{\"offset\": 5}"`)
    expect(result!.name).toEqual('list-item')
    expect(result!.parameters).toEqual({
      offset: 5
    })

    const fulfilment = new MockFulfilment()
    const intentDetector = new MockIntentDetector()
    const messagingClientProvider = new MockMessagingClientProvider()
    const mockPublishIntentFn = jest.fn(async (arg) => { })
    fulfilment.publishIntent = mockPublishIntentFn
    messagingClientProvider.get = jest.fn((): MessagingClient => {
      const msgClient = new MockMessagingClient()
      msgClient.getProfile = jest.fn(async (): Promise<LineMessageClientGetProfileOutput> => {
        return {
          displayName: "",
          pictureUrl: "",
          provider: "line",
          userId: "me-1",
        }
      })
      return msgClient
    })


    const { handle } = intentMessageHandler(
      fulfilment,
      intentDetector,
      messagingClientProvider,
    )

    await handle({
      message: `shio bypass list-item "{\"offset\": 5, \"filter\": \"recent\"}"`,
      provider: 'line',
      replyToken: 'test-reply-token',
      source: {
        userId: "me-1",
        type: 'user'
      },
      timestamp: Date.now(),
      type: 'textMessage'
    })

    expect(fulfilment.publishIntent).toBeCalledTimes(1)
    const arg: IncomingMessage = mockPublishIntentFn.mock.calls[0][0]
    expect(arg.intent.name).toEqual(ListItemEventMessageIntentKind)
  })



})