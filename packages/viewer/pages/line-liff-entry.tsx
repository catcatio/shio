import * as React from 'react'
import Head from 'next/head'
import { BasePage } from '../components/BasePage';
import { NextContext } from 'next';

// LineLiff global window type
// declare on lineSDK scripts
interface LineContext {
  userId: string
}
interface LineLiff {
  init: (onCompleted: (data: { context: LineContext }) => void, onError: (error: Error) => void) => void
  getAccessToken: () => string
}
declare var liff: LineLiff

export default class LinePage extends BasePage<{ pageName: string }, { err?: Error, href?: string }> {
  static async getInitialProps(ctx: NextContext) {
    const p = await BasePage.getInitialProps(ctx)
    const pageName = ctx.query['pageName']
    if (typeof pageName !== 'string') {
      throw new Error('pageName is invalid')
    }
    return {
      ...p,
      pageName
    }
  }
  constructor(p) {
    super(p)
    this.state = {}
  }

  componentDidMount() {

    liff.init(
      data => {
        // Now you can call LIFF API
        const userId = data.context.userId;
        const token = liff.getAccessToken()
        const targetUrl = new URL(this.props.hostUrl)

        const query = new URLSearchParams(window.location.search)
        // forward querystring
        query.forEach((value, key) => {
          console.log(key, value)
          if (key !== 'pageName') {
            targetUrl.searchParams.append(key, value)
          }
        })

        targetUrl.pathname = "/view/" + this.props.pageName
        targetUrl.searchParams.append('provider', 'line')
        targetUrl.searchParams.append('providerAccessToken', token)
        targetUrl.searchParams.append('providerUserId', userId)

        this.setState({ href: targetUrl.href })

      },
      err => {
        // LIFF initialization failed
        console.error(err)
        this.setState({ err })
      }
    );
  }

  render() {
    return (
      <>
        <Head>
          <script src={this.props.lineSDK}></script>
        </Head>
        <div>
          {!this.state.err ? 'Processing.....' : "Something wrong..."}<br />
          <a href={this.state.href}>
            <code>
              {this.state.href}
            </code>
          </a>
        </div>
      </>
    )
  }
}