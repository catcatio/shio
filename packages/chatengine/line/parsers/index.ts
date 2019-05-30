import { Source, ParsedMessage } from '../../types'
import { EventParsers, Event } from './types'
import messageEventParser = require('./messageEventParser')
import followEventParser = require('./followEventParser')
import unfollowEventParser = require('./unfollowEventParser')
import postbackEventParser = require('./postbackEventHandler')
import beaconEventParser = require('./beaconEventParser')
import defaultEventParser = require('./defaultEventParser')

export const lineProvider = 'line'

export const getSource = (source: any): Source => {
  if (!source) {
    return {
      type: 'user',
      userId: '???'
    }
  }

  switch (source.type) {
    case 'user':
      return {
        type: 'user',
        userId: source.userId
      }
    case 'room':
      return {
        type: 'room',
        roomId: source.roomId,
        userId: source.userId
      }
    case 'group':
      return {
        type: 'group',
        groupId: source.groupId,
        userId: source.userId
      }
    default:
      return {
        type: 'user',
        userId: '???'
      }
  }
}

/**
 * more available events
 * - Account link event
 * - Device link event
 * - Device unlink event
 * - LINE Things scenario execution event
 * see https://developers.line.biz/en/reference/messaging-api/
 */

const eventParsers: EventParsers = {
  [messageEventParser.eventType]: messageEventParser.handler,
  [followEventParser.eventType]: followEventParser.handler,
  [unfollowEventParser.eventType]: unfollowEventParser.handler,
  [postbackEventParser.eventType]: postbackEventParser.handler,
  [beaconEventParser.eventType]: beaconEventParser.handler
}

const isSystemVerificationEvent = ({ replyToken }) => {
  return replyToken === '00000000000000000000000000000000' || replyToken === 'ffffffffffffffffffffffffffffffff'
}

export default (event: Event): ParsedMessage | null => {
  if (isSystemVerificationEvent(event)) return null
  const eventParser = eventParsers[event.type] || defaultEventParser.handler
  let msg = eventParser(event)
  msg.original = event
  return msg
}
