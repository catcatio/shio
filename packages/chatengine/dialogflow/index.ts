import { IntentDetector, ParsedMessage, Intent, empty, MessageType, IntentParameters } from '../types'
import { SessionsClient } from 'dialogflow'
import structjson from '../utils/dialogflow/structjson';

export class DialogFlowIntentDetector implements IntentDetector {
  constructor(private clientOption: any) {
  }

  isSupport(msgType: MessageType): boolean {
    return msgType === 'textMessage'
  }

  async detect(parsedMessage: ParsedMessage): Promise<Intent | empty> {
    const sessionClient = new SessionsClient(this.clientOption)
    const userId = parsedMessage.source ? parsedMessage.source.userId : '???'
    const source = parsedMessage.provider
    const type = parsedMessage.type
    const languageCode = 'en'

    const sessionPath = sessionClient.sessionPath(this.clientOption.projectId, userId)

    const queryParamsPayload = {
      source,
      userId,
      type,
      message: parsedMessage.message,
      data: parsedMessage
    }
    const query = {
      session: sessionPath,
      queryInput: {
        text: {
          text: parsedMessage.message as string,
          languageCode: languageCode
        },
      },
      queryParams: {
        // https://github.com/dialogflow/dialogflow-nodejs-client-v2/issues/9
        payload: structjson.jsonToStructProto(queryParamsPayload)
      }
    }

    const responses = await sessionClient.detectIntent(query);

    console.log(JSON.stringify(responses[0], null, 2))
    let params: IntentParameters = {}
    let fields = responses[0].queryResult.parameters['fields']
    fields && Object.keys(fields).forEach(
      f => {
        console.log(f)
        params[f] = fields[f][fields[f]['kind']]
      }
    )
    return {
      'name': responses[0].queryResult.action,
      'parameters': params
    }
  }
}
