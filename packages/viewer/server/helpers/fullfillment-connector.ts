import { MessageProvider, OutgoingMessage, WhoMessageFulfilmentKind, WhoMessageFulfillment } from "@shio-bot/foundation/entities";
import  { URL } from 'url'
import * as fetch from 'isomorphic-fetch'

if (typeof window !== 'undefined') {
  console.error("fulfillment connector only available on server side")
  process.exit(2)
}

export class FulfillmentConnector {

  public endpoint: string
  constructor(endpoint: string){
    this.endpoint = endpoint
  }


  async call<T>(method: 'GET' | 'POST', path: string, session: string): Promise<T> {
    const url = new URL(this.endpoint + path)
    const resp = await fetch(url.href, {
      method,
      headers: {
        'Authorization': session
      }
    })
    const result = await resp.json()
    return result
  }

  async getAsset(providerName: string, providerUserId: string, assetId: string) {
    
  }

  async getUserProfile(providerName: MessageProvider, providerUserId: string): Promise<WhoMessageFulfillment> {
    const resp = await this.call<OutgoingMessage>('GET', '/internal/who', `${providerName} ${providerUserId}`)

    const whoFulfillment = resp.fulfillment.find((f): f is WhoMessageFulfillment => { return f.name === WhoMessageFulfilmentKind })

    if (!whoFulfillment) {
      throw new Error('cannot get user information') 
    }
    return whoFulfillment
  }
}