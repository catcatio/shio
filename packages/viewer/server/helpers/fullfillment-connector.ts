import { MessageProvider, OutgoingMessage, WhoMessageFulfilmentKind, WhoMessageFulfillment, MessageIntent, DescribeItemMessageIntentKind, DescribeItemMessageFulfillment, DescribeItemMessageFulfillmentKind, GetItemDownloadUrlEventMessageIntentKind, GetItemDownloadUrlEventMessageFulfillmentKind, GetItemDownloadUrlEventMessageFulfillment, WhoMessageIntentKind } from "@shio-bot/foundation/entities";
import { URL } from 'url'
import * as fetch from 'isomorphic-fetch'

if (typeof window !== 'undefined') {
  console.error("fulfillment connector only available on server side")
  process.exit(2)
}

export class FulfillmentConnector {

  public endpoint: string
  constructor(endpoint: string) {
    this.endpoint = endpoint
  }


  async call<T>(method: 'GET' | 'POST', fulfillmentKind: MessageIntent['name'], session: string, query: { [key: string]: string } = {}): Promise<T> {
    const url = new URL(this.endpoint + '/internal/' + fulfillmentKind)
    Object.keys(query).forEach(k => {
      url.searchParams.append(k, query[k])
    })
    const resp = await fetch(url.href, {
      method,
      headers: {
        'Authorization': session
      }
    })
    const result = await resp.text()
    try {
      return JSON.parse(result)
    } catch (e) {
      console.error("RESPONSE FROM " + url.href + " is invalid\n" + result)
      throw e
    }
  }

  createSessionToken(provider: MessageProvider, providerUserId: string) {
    return `${provider} ${providerUserId}`
  }

  async getAsset(providerName: MessageProvider, providerUserId: string, assetId: string) {
    const resp = await this.call<OutgoingMessage>('GET', DescribeItemMessageIntentKind, this.createSessionToken(providerName, providerUserId), {
      id: assetId,
    })
    const describe = resp.fulfillment.find((f): f is DescribeItemMessageFulfillment => { return f.name === DescribeItemMessageFulfillmentKind })

    if (!describe) {
      throw new Error('cannot get asset')
    }
    return describe
  }

  async getAssetDownloadableUrl(providerName: MessageProvider, providerUserId: string, assetId: string) {
    const resp = await this.call<OutgoingMessage>('GET', GetItemDownloadUrlEventMessageIntentKind, this.createSessionToken(providerName,providerUserId), {
      assetId,
    })
    const downloadable = resp.fulfillment.find((f): f is GetItemDownloadUrlEventMessageFulfillment => {
      return f.name === GetItemDownloadUrlEventMessageFulfillmentKind 
    })

    if (!downloadable) {
      throw new Error('cannot get download url of asset')
    }
    return downloadable
  }

  async getUserProfile(providerName: MessageProvider, providerUserId: string): Promise<WhoMessageFulfillment> {
    const resp = await this.call<OutgoingMessage>('GET', WhoMessageIntentKind, this.createSessionToken(providerName, providerUserId))
    const whoFulfillment = resp.fulfillment.find((f): f is WhoMessageFulfillment => { return f.name === WhoMessageFulfilmentKind })

    if (!whoFulfillment) {
      throw new Error('cannot get user information\n' + JSON.stringify(resp))
    }
    return whoFulfillment
  }
}