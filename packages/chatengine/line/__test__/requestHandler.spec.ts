import { requestHandler } from '../requestHandler'
import { deepStrictEqual } from 'assert'

describe('LineRequestHandler test', () => {
  it('should throw error if channelSecret is empty', () => {
    const channelSecret = ''
    expect(() => requestHandler(channelSecret)).toThrow('no channel secret')
  })

  it('should throw error of header not found', () => {
    const channelSecret = 'test_channel_secret'
    let handler = requestHandler(channelSecret)

    let req: any = {
      headers: {}
    }

    expect(() => handler(req)).toThrow('no signature')
  })

  it('should be able to return event object (body is string)', () => {
    const channelSecret = 'test_channel_secret'
    let handler = requestHandler(channelSecret)
    let event = {
      message: {
        id: 'test_event_message_id',
        text: 'this is test message.',
        type: 'text'
      },
      replyToken: 'test_reply_token',
      source: {
        groupId: 'test_group_id',
        type: 'group'
      },
      timestamp: 0,
      type: 'message'
    }
    let req: any = {
      headers: { 'x-line-signature': 'wqJD7WAIZhWcXThMCf8jZnwG3Hmn7EF36plkQGkj48w=' },
      body: JSON.stringify({
        events: [event],
        destination: 'Uaaaabbbbccccddddeeeeffff'
      })
    }

    let rawMsg = handler(req)

    expect(rawMsg).not.toBeNull()
    expect(rawMsg.events).not.toBeNull()
    expect(rawMsg.events && rawMsg.events.length).toEqual(1)
    deepStrictEqual(rawMsg.events[0], event)
  })

  it('should be able to return event object (body is buffer)', () => {
    const channelSecret = 'test_channel_secret'
    let handler = requestHandler(channelSecret)
    let event = {
      message: {
        id: 'test_event_message_id',
        text: 'this is test message.',
        type: 'text'
      },
      replyToken: 'test_reply_token',
      source: {
        groupId: 'test_group_id',
        type: 'group'
      },
      timestamp: 0,
      type: 'message'
    }
    let req: any = {
      headers: { 'x-line-signature': 'wqJD7WAIZhWcXThMCf8jZnwG3Hmn7EF36plkQGkj48w=' },
      body: Buffer.from(
        JSON.stringify({
          events: [event],
          destination: 'Uaaaabbbbccccddddeeeeffff'
        }),
        'utf-8'
      )
    }

    let rawMsg = handler(req)

    expect(rawMsg).not.toBeNull()
    expect(rawMsg.events).not.toBeNull()
    expect(rawMsg.events && rawMsg.events.length).toEqual(1)
    deepStrictEqual(rawMsg.events[0], event)
  })

  it('should be able to return event object (body is json)', () => {
    const channelSecret = 'test_channel_secret'
    let handler = requestHandler(channelSecret)
    let event = {
      message: {
        id: 'test_event_message_id',
        text: 'this is test message.',
        type: 'text'
      },
      replyToken: 'test_reply_token',
      source: {
        groupId: 'test_group_id',
        type: 'group'
      },
      timestamp: 0,
      type: 'message'
    }
    let req: any = {
      headers: { 'x-line-signature': 'wqJD7WAIZhWcXThMCf8jZnwG3Hmn7EF36plkQGkj48w=' },
      body: {
        events: [event],
        destination: 'Uaaaabbbbccccddddeeeeffff'
      }
    }

    let rawMsg = handler(req)
    expect(rawMsg).not.toBeNull()
    expect(rawMsg.events).not.toBeNull()
    expect(rawMsg.events && rawMsg.events.length).toEqual(1)
    deepStrictEqual(rawMsg.events[0], event)
  })

  it('should ignore signature when having `x-shio-debug` in header', () => {
    const channelSecret = 'test_channel_secret'
    let handler = requestHandler(channelSecret)

    let req: any = {
      headers: { 'x-shio-debug': 'true' },
      body: '{"events":[]}'
    }

    let rawMsg = handler(req)

    expect(rawMsg).not.toBeNull()
    expect(rawMsg.events).not.toBeNull()
    expect(rawMsg.events && rawMsg.events.length).toEqual(0)
  })
})
