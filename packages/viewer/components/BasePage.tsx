import * as React from 'react'
import { NextContext } from 'next'
import { isMessageProvider } from '../common/type-guard';


export class BasePage<T = {}> extends React.Component<T & { provider: string, providerUserId: string, hostUrl: string, loopbackUrl: string }> {
  static async getInitialProps(ctx: NextContext) {
    let { hostUrl, loopbackUrl, providerUserId } = ctx.query;
    const provider = isMessageProvider(ctx.query.provider)
    if (!provider) {
      throw new Error('Invalid message provider: ' + provider)
    }
    if (typeof hostUrl !== 'string' || typeof loopbackUrl !== 'string' || typeof provider !== 'string' || typeof providerUserId !== 'string') {
      throw new Error("Host URL or Loopback URL is not provide to application")
    }
    return {
      hostUrl,
      loopbackUrl,
      provider,
      providerUserId,
    };
  }
}