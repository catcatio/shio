import { createHmac, timingSafeEqual } from 'crypto'

function stringToBuffer(str: string, encoding: BufferEncoding): Buffer {
  if (Buffer.from) {
    try {
      return Buffer.from(str, encoding)
    } catch (err) {
      if (err.name === 'TypeError') {
        return new Buffer(str, encoding)
      }
      throw err
    }
  } else {
    return new Buffer(str, encoding)
  }
}

function safeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  if (timingSafeEqual) {
    return timingSafeEqual(a, b)
  } else {
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i]
    }
    return result === 0
  }
}

export default function validateSignature(body: string | Buffer, channelSecret: string, signature: string): boolean {
  return safeCompare(
    createHmac('SHA256', channelSecret)
      .update(body)
      .digest(),
    stringToBuffer(signature, 'base64')
  )
}

export const makeSignature = (body: string | Buffer, channelSecret: string): string => {
  return createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')
}
