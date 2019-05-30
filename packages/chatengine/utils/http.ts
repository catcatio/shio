import { default as fetch, Request } from 'node-fetch'
import { URLSearchParams } from 'url'

const buildParams = (url: string, params: any): string => {
  let urlParams = !params ? '' : new URLSearchParams(params).toString()
  return urlParams ? `${url}${url.includes('?') ? '&' : '?'}${urlParams}` : url
}

export default class HTTPClient {
  constructor(private baseUrl?: string, private defaultHeaders?: any) {
    this.baseUrl = this.baseUrl || ''
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.substr(0, this.baseUrl.length - 1)
    }
  }

  async get<T>(url: string, params?: any, headers?: any): Promise<T> {
    url = `${this.baseUrl}${buildParams(url, params)}`

    return fetch(url, {
      method: 'GET',
      headers: Object.assign({}, this.defaultHeaders, headers)
    }).then(response => {
      return (response.json() as unknown) as T
    })
  }

  public async post<T>(url: string, body?: any, headers?: any): Promise<T> {
    url = `${this.baseUrl}${url}}`

    return fetch(url, {
      method: 'POST',
      headers: Object.assign({}, this.defaultHeaders, headers),
      body: body
    }).then(response => {
      return (response.json() as unknown) as T
    })
  }

  public async put<T>(url: string, body?: any, headers?: any): Promise<T> {
    url = `${this.baseUrl}${url}}`

    return fetch(url, {
      method: 'POST',
      headers: Object.assign({}, this.defaultHeaders, headers),
      body: body
    }).then(response => {
      return (response.json() as unknown) as T
    })
  }

  public async delete<T>(url: string, params?: any, headers?: any): Promise<T> {
    url = `${this.baseUrl}${buildParams(url, params)}`

    return fetch(url, {
      method: 'DELETE',
      headers: Object.assign({}, this.defaultHeaders, headers)
    }).then(response => {
      return (response.json() as unknown) as T
    })
  }

  private wrapError(err: any): Error {
    return null as any
  }
}
