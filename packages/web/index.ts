import { server } from './server'
import { Configurations } from './types';
import { makeSignature } from '@shio-bot/chatengine/line/validate-signature';

let config: Configurations = {
  port: 3000,
  chatEngine: {
    line: {
      clientConfig: {
        channelAccessToken: '',
        channelSecret: '',
        channelId: '',
      }
    },
    dialogflow: {
      credentials: {
        client_email: '',
        private_key: ''
      },
      apiKey: '',
      projectId: ''
    }
  }
}

const body = {
  "events": [
      {
          "message": {
              "id": "test_event_message_id",
              "text": "I am 15 year old.",
              "type": "text"
          },
          "replyToken": "test_reply_token",
          "source": {
              "groupId": "test_group_id",
              "type": "group",
              "userId": "test_user_id"
          },
          "timestamp": 0,
          "type": "message"
      }
  ],
  "destination": "Uaaaabbbbccccddddeeeeffff"
}

console.log(makeSignature(JSON.stringify(body), '9a0ed416478f0582c20afdbf36ac2c9e'))

server(config)
  .start()
  .then(_ => console.log('D O N E'))
  .catch(err => console.error(err))
