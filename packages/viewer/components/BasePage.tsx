import * as React from 'react'
import { NextContext } from 'next'
import { isMessageProvider } from '../common/type-guard';
import { ShioBaseInitialProps } from '../common/service-connector';
import Router from 'next/router'
function optionalQuery(q: any, key: string[]) {
  return key.map((k): string | undefined => {
    return q[k]
  })
}
function requireQuery(q: any, key: string[]) {
  // @TODO: must looking on
  // local storage or memory
  // for requireQuery attriibutes
  return key.map((k): string => {
    if (typeof q[k] !== 'string') {
      throw new Error(`${k} is not provided`)
    }
    return q[k]
  })
}

// Router.beforePopState(({ url, as, options }) => {
//   // @TODO:
//   // force ssr to skip
//   // complex local state
//   // InitialProps
//   window.location.href = as
//   return false
// })

export class BasePage<T = {}, s = {}> extends React.Component<T & ShioBaseInitialProps, s> {
  static async getInitialPropsWithCredentialOrThrow(ctx: NextContext) {
    const props = await BasePage.getInitialProps(ctx)
    const { providerUserId, providerAccessToken } = props
    if (typeof providerAccessToken !== 'string' || typeof providerUserId !== 'string') {
      throw new Error("Invalid provider credentials")
    }
    return {
      ...props,
      providerUserId,
      providerAccessToken,
    }
  }
  static async getInitialProps(ctx: NextContext): Promise<ShioBaseInitialProps> {
    let [hostUrl, loopbackUrl, lineSDK,] = requireQuery({
      ...ctx.query,
    }, [
        "hostUrl", "loopbackUrl", "lineSDK",
      ]);
    const [
      providerAccessToken, providerUserId
    ] = optionalQuery({
      ...ctx.query
    }, [
        "providerAccessToken", "providerUserId"
      ])
    const provider = isMessageProvider(ctx.query.provider)
    if (!provider) {
      throw new Error('Invalid message provider: ' + provider)
    }
    return {
      hostUrl,
      loopbackUrl,
      provider,
      providerUserId,
      providerAccessToken,
      lineSDK,
    };
  }
}