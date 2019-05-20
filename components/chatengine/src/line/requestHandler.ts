import { Request, RequestHandler } from '../types'
import validateSignature from './validate-signature'

const bodyToJson = (body: any) : object => {
  if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
    return body
  }

  const strBody = Buffer.isBuffer(body) ? body.toString() : body;
  return JSON.parse(strBody)
}

const bodyToString = (body: any) : string => {
  if (typeof body == 'string') {
    return body
  }

  return Buffer.isBuffer(body) ? body.toString() : JSON.stringify(body)
}

export class LineRequestHandler implements RequestHandler {
  constructor(private channelSecret: string) {
    if (!this.channelSecret) {
      throw new Error('no channel secret')
    }
  }

  handle(req: Request): any {
    if (req.headers['x-shio-debug']) {
      console.log('debug mode: ignore signature')
      return bodyToJson(req.body)
    }

    const signature = req.headers['x-line-signature'] as string

    if (!signature) {
      throw new Error('no signature')
    }

    let strBody = bodyToString(req.body)

    if (!validateSignature(strBody, this.channelSecret, signature)) {
      throw new Error('signature validation failed')
    }

    return bodyToJson(req.body)
  }
}

export class LineNonValidateRequestHandler implements RequestHandler {
  handle(req: Request): object {
    if (typeof req.body !== 'string' && !Buffer.isBuffer(req.body)) {
      // just return body object
      return req.body
    }

    // convert body to JSON object
    const strBody = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
    return JSON.parse(strBody)
  }

}