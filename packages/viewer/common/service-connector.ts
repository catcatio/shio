
import * as fetch from 'isomorphic-fetch'
import { WhoMessageFulfillment, MessageProvider } from '@shio-bot/foundation/entities';

export const GetProfilePath = '/my-profile'
export const GetBookDetailPath = '/book/:bookId'

export type ShioViewerServiceAPIPath = typeof GetProfilePath | typeof GetBookDetailPath
export type ShioServiceConnectorCredential = {
  provider: MessageProvider
  providerUserId: string
}
export type ShioViewerServiceQueryObject = { [key: string]: string | number }

export class ServiceConnector {

  hostURL: string
  loopbackURL: string
  credential?: ShioServiceConnectorCredential

  constructor(hostURL: string, loopbacURL: string) {
    this.loopbackURL = loopbacURL
    this.hostURL = hostURL
  }

  static getInstance(hsotURL: string, loopbackURL: string) {
    return new ServiceConnector(hsotURL, loopbackURL)
  }

  static isCredential(v: ServiceConnector): v is ServiceConnector & { credential: ShioServiceConnectorCredential } {
    return typeof v.credential !== 'undefined'
  }

  withCredential(cred: ShioServiceConnectorCredential): ServiceConnector & { credential: ShioServiceConnectorCredential } {
    const service = new ServiceConnector(this.hostURL, this.loopbackURL)
    service.credential = cred
    if (ServiceConnector.isCredential(service)) {
      return service
    }
  }

  async request<Result>(method: "GET" | "POST", path: ShioViewerServiceAPIPath, query?: ShioViewerServiceQueryObject, body?: any): Promise<Result> {
    let url: URL
    if (typeof window !== 'undefined') {
      url = new URL(this.hostURL + path)
    } else {
      url = new URL(this.loopbackURL + path)
    }

    if (query) {
      Object.keys(query).forEach(k => {
        url.searchParams.append(k, query[k] + "")
      })
    }

    let header: { [key: string]: string } = {}
    if (this.credential) {
      header['x-provider'] = this.credential.provider
      header['x-provider-user-id'] = this.credential.providerUserId
    }
    const resp = await fetch(url.href, {
      method,
      headers: {
        'content-type': "application/json",
        ...header
      },
      body: JSON.stringify(body),
    })

    if (resp.status >= 400) {
      throw new Error('service response status code: ' + resp.status + ' for ' + url.href)
    }


    try {
      const result = await resp.json()
      return result
    } catch (e) {
      const paylaod = await resp.text()
      console.error(paylaod)
      throw new Error('service response is not json (see log for more detail) ')
    }
  }


  async getProfile(): Promise<WhoMessageFulfillment['parameters']> {
    const result = await this.request<WhoMessageFulfillment['parameters']>('GET', GetProfilePath)
    return result
  }


}