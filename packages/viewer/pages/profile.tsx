import * as React from 'react'
import { NextContext } from 'next'
import { BasePage } from '../components/BasePage';
import { WhoMessageFulfillment } from '@shio-bot/foundation/entities';
import { ServiceConnector } from '../common/service-connector';


export default class ProfilePage extends BasePage<{ profile: WhoMessageFulfillment['parameters'] }>  {

  static async getInitialProps(c: NextContext<Record<string, string | string[]>, {}>) {
    const p = await super.getInitialProps(c)
    const { hostUrl, loopbackUrl, provider, providerUserId } = p
    const service = ServiceConnector
      .getInstance(hostUrl, loopbackUrl)
      .withCredential({
        provider, providerUserId
      })
    const result = await service.getProfile()
    return {
      ...p,
      profile: result,
    }
  }

  render() {
    return (
      <div>
        Hello, {this.props.profile.displayName}<br />
        CurrentProvider is {this.props.provider}
      </div>
    )
  }
}