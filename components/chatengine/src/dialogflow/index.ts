import { IntentDetector, ParsedMessage, Intent, empty, MessageType, IntentParameters } from '../types'
import { SessionsClient } from 'dialogflow'
import structjson from '../utils/dialogflow/structjson';

/**
clientOption: {
  'credentials': {
    'client_email': 'dialogflow-gviplb@unicorn-admin.iam.gserviceaccount.com',
    'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwzC0QrmgtSMwD\ni2mOxfdKvYxbW3nAtD8XkUd99lakFN0QgdsCgV+TJW0U7ge7dNCI+thGNalMZWfe\nwyI+amETShIGdr21zFSukHdWT3f7klLT21RlvVdfpJ/I+pRL9Fw5VhpqFFpc4Fxx\nXnVnppY4wfwKAjaeSd9L7jkIcBuw5NwoBI4LUm3eBWMKu+p8IyKKJK0AdWoXyKbf\n+TohW6EcBVY5lss+4ZCwI+suUqPBE9ucY9RsPX5USTqDk2jd7ZCzziwFpKhrIDJd\ns3JvRWxbv9BPW4HgIK3YSyUOrByBUgwFZaX/9+MUXoRuwVnoh0QE72Lf4dryiikO\nlX9tlvI1AgMBAAECggEABwauOc38lOQiO3fUY5ipeb5rsAvEHGztXvXmlfJuwgmU\nOX43onNaxYHEwoKtKv169h6l7rBeQIt9I8S0fS+EGRyl97zLUEjFCsTyASuaVJSd\nlw7N3Vc3fDUSJo4Sy6vz6FFsLlANwUgnVFgRKWPc73eCGTG6UvMTnTRj7tppt09o\nI+mKJR6cVefBP62VaDjoyhLl5E+iR9D3ylhCo4SNMHKXkoPTQ8Sgk9t11LTQMR61\n7eMzIjhs4pcowCW5b3ztWUdBHMbn36aPspokT/pyh0SLOU0af/SWQst6N4J+xT5W\nCYq8xuOXXArw4VzHY6eEU/uoWRuMMAphx8QAikxndwKBgQDf6LfVs5RR7gduyYZw\nCu44GhHahCPS2lCQ7WaIY3BUIU0Sq6zkavFsiT3iel2wkeTUigilIGRhWsRLitd/\nhmay7jrTnHllVmXA3WcGU93C59YKVLpDBI6GQ/bSgcu9rmhIK530CEr5XZRXVZFn\nJWWNVtinRhKPv/HTlWGzUxT1gwKBgQDKIuzIM39BlN3x85M9bB0UNpqQ55nsnHF9\nXlg2aG+hNxeaxwfzjCWT6Sr3iOQaXCle+9Wz8spPWPS02ewQ7rZn/5tEv9w4juky\nIuNoBCIrUuFSNPuYTA6R/dJhS5cRDUmrfIYN6Bv1M3Fgn1blZrKlYXjYIN9V2oTj\nyPAkiUmj5wKBgQCvymjSOawf6s4hF80ZmCtRFn6f3ZC2kTohnpEaUV+2XXLCTtBt\ngNzMhq90aPe3kcNjbn+9DMJigL2ORZJNB7sHjevXiYjxm7RFiE3DdQKtbBDqiXy2\n8xPmq+NTgB3ybMRorP3UwtICF4tISeDfZ0fkgKOWKHiYLW1x3V0YSgkxewKBgCRV\nSsJhn0omfA51fc3YlRGBDx9kweIp7KxgPPLqqsYLpQ6JIADC/C4uBy8fSAEE99q+\n4ZbK2VqR3spzMV+JyPfAliQxaGAyL/B3HPEhbRLkfuPL6j1hzmyndx1N/QVvogJV\nC7OMORpF+OcpPPFXGF1pu9L9dad089YN1Dx9AOOZAoGAKOrP1JIMmnZXLGH478Xl\n6QZ5gZfsbs0I/1QWE6llaZXS8qcnrcLm2N0QcYc6lU01XGAM4Oq0Zrw1hR+vmgSV\nRyIq/ZQPh9OTmFXrCVliZ9aIAHrYIydals8K1USDu8tt5GVvSCpwhiyTl4XrvjRU\nfMP0x60kbisuxcusV4gtqFM=\n-----END PRIVATE KEY-----\n'
  },
  'apiKey': 'AIzaSyBTBn6RoqjaksRRcu-LoNDw-mAirZPZEoM',
  'projectId': 'unicorn-admin'
}
 */

export class DialogFlowIntentDetector implements IntentDetector {
  constructor(private clientOption: any) {
  }

  IsSupport(msgType: MessageType): boolean {
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

const start = async () => {
  let clientOption = {
    "credentials": {
      "client_email": "dialogflow-gvsegq@catcat-bookshelf.iam.gserviceaccount.com",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdEJnbYLI4vG/1\n8+epHYB4vXkJFjmmYjj5uPmABBSoVHH59OKHUlY+Dr/bkgmTPTzukhnpzCjzQ5Oi\ntt3xoF6VTayUXwg/H5+7rgxRLalyTeE0h98IL48xN2spSXPQtbN/AfPn+R+bRbXu\nMqdsZ2Kb/++HzXwmNVW4wydI2V745LXtx7c2V6R3XkyaUl+cQWfEjf9Jz9B4pHUB\nZLCK2FBOLn2p986pBFHXXw0y134A8WF43zVQKoJqaUSBYuibiuLggSRA676qLRft\nxcsArwCDyGgSbWo7E03fs7JemAG177NEfnvWO8yjAGVKyNkcdV2ECoTr7c2KTCVC\nRxGyA8RFAgMBAAECggEAA3+LK79NOrFyr8icYnRNejunV2yNsijCQDi8Nq7PLosS\n4v120I+N6VKoQxQoc3cdMyTxOjOpSeYzHHilLPkYc2ePWFQOUu9lbUh3uJjOzQ4B\n8b1HsH8OK/LK+ZQzEWWwBuMT8MMOtrvk6+AgfvTo3iaalq0lWTZwBOnjrIGyFiFY\nMwobcRbdMpc8EQ+rtW+SAdzlbHFY8jTBahYM2KOZVi9J9/M+BMBW9j8cW8xIh/Ws\nDK3J80A/IIM8X/qf/BnHHudRLl3136raDvLd6i/wCMkE2lMkyJEHm9gfoxf1LgkC\n5EzEbfU5xGwyQX5syadp3W5d8EwfeFJbgEGly7ngsQKBgQD3f76tIaUrqm6Uj5OO\nb+vkbqMvEF8REeJVnpKLbunrDv4xbgE1RRI2dDucMJUe705xJUV1ySU7tGk+pVnz\nGeP8qvA/khr2F68+z9gIB2fi/oYXGpTI9VTCE4XCwmlOIoqQ8v+VztqFjclgTtp+\nAFNoReX0tW7X5e2LV0LKI6JFkQKBgQDkqGvITz9kLfFttZtuTjogjUvbJVvAhQJF\n2c84VkMcYLVKGPuF8+7i8Om8XE1weSiqV2JhsgvzW2E0hajSRnJpDfusqkFOdGcq\nMYJ/4URtdti23zQfF2ysXwljBM0b88hNS60VnVI/KvJFGLnvN/oBYGWuOdAq6axM\ndmgtdnnpdQKBgQDTglkqThGAgpMj5JteY6l9O0u7ocsMpHL/ZpeoDy5a0iJLjc38\nfz20SZrTvPUDTdGEgiydHzvxjRlQDzESvvKGcHMGcM8Xtl/uVuMw4VtXstpXDkFO\nh9JaVSK/sTMbMgunGfNwTCmVbvlEk77HZXHiL7H4ccD7QqTBqt4KL2+y8QKBgCWo\n/6eMNdqgHoV9Rc5TIAvAed/sNUJuJcOvbgvPWVpRK0q69qJHXO8P0s9tPGvr6KC1\np8SDeKhqQoZOBVIsvCdFYFA98mejkGJIqT+6sHR/AI6OEJ2WVBXHyVn/rnCOJE1m\ny2kl8ifpQOHUgrs9svWLFPQvHXQT7IbjcaEbRFUJAoGBAMEOxe/pX6mC4H6GqUby\nVKxhQ20Eh3FwTxWzwAm512Z1zcFi7WTjMFYo6uJSQ2fCVvrto7wbQPp1I37wKj5r\n80FC55xVeFWBhu3SgSYPko3xRc9sxL3rhqTljlzZnXenGmFPIjAr3b6P0QKfFajy\nRZG790D3vfTbc/m7VllXj4wB\n-----END PRIVATE KEY-----\n"
    },
    "apiKey": "AIzaSyBTBn6RoqjaksRRcu-LoNDw-mAirZPZEoM",
    "projectId": "catcat-bookshelf"
  }
  let detector = new DialogFlowIntentDetector(clientOption)

  console.log('isSupport', detector.IsSupport('textMessage'))
  console.log('isSupport', detector.IsSupport('imageMessage'))

  let msg: ParsedMessage = {
    // message: 'view book star in the jar',
    // message: 'suggestion all good',
    message: 'i am 1245 year old',
    type: 'textMessage',
    replyToken: 'reply_token',
    source: {
      type: 'user',
      userId: 'user_id'
    },
    provider: 'line',
    timestamp: Date.now()
  }

  const intent = await detector.detect(msg)
  console.log(JSON.stringify(intent, null, 2))
}

start()
  .then(_ => console.log('D O N E'))
  .catch(err => console.error(err))
