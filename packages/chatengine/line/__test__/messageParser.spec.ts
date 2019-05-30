import { LineMessageParser } from '../messageParser'

describe('LineMessageParser test', () => {
  it('should be able to parse system validation event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: '00000000000000000000000000000000'
        },
        {
          replyToken: 'ffffffffffffffffffffffffffffffff'
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toEqual(2)
    expect(msgs[0]).toBeNull()
    expect(msgs[1]).toBeNull()
  })

  it('should be able to parse follow event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
          type: 'follow',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message).toEqual('')
    expect(msgs[0].type).toEqual('follow')
    expect(msgs[0].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCTA')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse unfollow event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          type: 'unfollow',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message).toEqual('')
    expect(msgs[0].type).toEqual('unfollow')
    expect(msgs[0].replyToken).toEqual('')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse beacon event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
          type: 'beacon',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          },
          beacon: {
            hwid: 'd41d8cd98f',
            type: 'enter'
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message && (msgs[0].message as any).hwid).toEqual('d41d8cd98f')
    expect(msgs[0].message && (msgs[0].message as any).type).toEqual('enter')
    expect(msgs[0].type).toEqual('beacon')
    expect(msgs[0].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCTA')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse postback event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          type: 'postback',
          replyToken: 'b60d432864f44d079f6d8efe86cf404b',
          source: {
            userId: 'U91eeaf62d',
            type: 'user'
          },
          timestamp: 1513669370317,
          postback: {
            data: 'storeId=12345',
            params: {
              datetime: '2017-12-25T01:00'
            }
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message && (msgs[0].message as any).data).toEqual('storeId=12345')
    expect(msgs[0].message && (msgs[0].message as any).params.datetime).toEqual('2017-12-25T01:00')
    expect(msgs[0].type).toEqual('postback')
    expect(msgs[0].replyToken).toEqual('b60d432864f44d079f6d8efe86cf404b')
    expect(msgs[0].timestamp).toEqual(1513669370317)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U91eeaf62d')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse unknown event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          type: 'notexistingevent',
          replyToken: 'b60d432864f44d079f6d8efe86cf404b',
          source: {
            userId: 'U91eeaf62d',
            type: 'user'
          },
          timestamp: 1513669370317
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message).toEqual('')
    expect(msgs[0].type).toEqual('unknown')
    expect(msgs[0].replyToken).toEqual('b60d432864f44d079f6d8efe86cf404b')
    expect(msgs[0].timestamp).toEqual(1513669370317)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U91eeaf62d')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse text message event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
          type: 'message',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          },
          message: {
            id: '325708',
            type: 'text',
            text: 'Hello, world!'
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message).toEqual('Hello, world!')
    expect(msgs[0].type).toEqual('textMessage')
    expect(msgs[0].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCTA')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse other message event', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
          type: 'message',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          },
          message: {
            id: '325708',
            type: 'image',
            contentProvider: {
              type: 'line'
            }
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(1)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message && (msgs[0].message as any).type).toEqual('image')
    expect(msgs[0].message && (msgs[0].message as any).id).toEqual('325708')
    expect(msgs[0].type).toEqual('imageMessage')
    expect(msgs[0].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCTA')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
  })

  it('should be able to parse multiple events', () => {
    let parser = new LineMessageParser()
    let rawMsgs = {
      events: [
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
          type: 'message',
          timestamp: 1462629479859,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          },
          message: {
            id: '325708',
            type: 'text',
            text: 'Hello, world!'
          }
        },
        {
          replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCBB',
          type: 'message',
          timestamp: 1462629479860,
          source: {
            type: 'user',
            userId: 'U4af4980629'
          },
          message: {
            id: '325709',
            type: 'image',
            contentProvider: {
              type: 'line'
            }
          }
        }
      ]
    }
    let msgs = parser.parse(rawMsgs)

    expect(msgs.length).toBe(2)
    expect(msgs[0]).not.toBeNull()
    expect(msgs[0].message).toEqual('Hello, world!')
    expect(msgs[0].type).toEqual('textMessage')
    expect(msgs[0].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCTA')
    expect(msgs[0].timestamp).toEqual(1462629479859)
    expect(msgs[0].source).not.toBeNull()
    expect(msgs[0].source && msgs[0].source.userId).toEqual('U4af4980629')
    expect(msgs[0].source && msgs[0].source.type).toEqual('user')
    expect(msgs[0].provider).toEqual('line')
    expect(msgs[1]).not.toBeNull()
    expect(msgs[1].message && (msgs[1].message as any).type).toEqual('image')
    expect(msgs[1].message && (msgs[1].message as any).id).toEqual('325709')
    expect(msgs[1].type).toEqual('imageMessage')
    expect(msgs[1].replyToken).toEqual('nHuyWiB7yP5Zw52FIkcQobQuGDXCBB')
    expect(msgs[1].timestamp).toEqual(1462629479860)
    expect(msgs[1].source).not.toBeNull()
    expect(msgs[1].source && msgs[1].source.userId).toEqual('U4af4980629')
    expect(msgs[1].source && msgs[1].source.type).toEqual('user')
    expect(msgs[1].provider).toEqual('line')
  })
})
