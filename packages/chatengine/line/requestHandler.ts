import validateSignature from './validate-signature'
import { Request } from 'express'

const bodyToJson = (body: any): object => {
  if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
    return body
  }

  const strBody = Buffer.isBuffer(body) ? body.toString() : body
  return JSON.parse(strBody)
}

const bodyToString = (body: any): string => {
  if (typeof body == 'string') {
    return body
  }

  return Buffer.isBuffer(body) ? body.toString() : JSON.stringify(body)
}

export const requestHandler = (channelSecret: string): ((req: Request) => any) => {
  if (!channelSecret) {
    throw new Error('no channel secret')
  }

  return (req: Request): any => {
    if (req.headers['x-shio-debug']) {
      console.log('debug mode: ignore signature')
      return bodyToJson(req.body)
    }

    const signature = req.headers['x-line-signature'] as string

    if (!signature) {
      throw new Error('no signature')
    }

    let strBody = bodyToString(req.body)

    if (!validateSignature(strBody, channelSecret, signature)) {
      throw new Error('signature validation failed')
    }

    return bodyToJson(req.body)
  }
}
