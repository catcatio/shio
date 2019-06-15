import * as React from 'react'
import { NextContext } from 'next'
import { BasePage } from '../components/BasePage';
import { ServiceConnector, GetAssetDetailResult } from '../common/service-connector';
import Link from 'next/link'


export default class AssetPage extends BasePage<{ asset: GetAssetDetailResult['data'] }>  {

  static async getInitialProps(c: NextContext<Record<string, string | string[]>, {}>) {
    const p = await BasePage.getInitialPropsWithCredentialOrThrow(c)
    const { hostUrl, loopbackUrl, provider, providerAccessToken, providerUserId } = p
    const service = ServiceConnector
      .getInstance(hostUrl, loopbackUrl)
      .withCredential({
        provider,
        providerAccessToken,
        providerUserId,
      })
    const assetId = c.query['assetId']
    if (typeof assetId !== 'string') {
      throw new Error('invalid asset ID')
    }
    const result = await service.getAsset(assetId)
    return {
      ...p,
      asset: result,
    }
  }

  render() {
    return (
      <div>
        Asset: <code>{this.props.asset.meta.id}</code><br />
        <a href={this.props.asset.download.url}>Click here</a>
      </div>
    )
  }
}