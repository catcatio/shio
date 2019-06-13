import { ReservePaymentListener, Payment } from '../types'
import { ReservePaymentMessage, ReservePaymentResultMessage } from '@shio-bot/foundation/entities'
import { PaymentClientProvider, LineReservePaymentRequest, PaymentClient, MessagingClientProvider } from '@shio-bot/chatengine'
import { PaymentRepository } from '../repositories'
import { newLogger } from '@shio-bot/foundation'

const formatPaymentMessage = (title: string, imageUrl: string, amount: number, currency: string, paymentWeb: string, paymentApp: string) => {
  let a = {
    type: 'bubble',
    hero: {
      type: 'image',
      url: `${imageUrl}`,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: 'http://linecorp.com/'
      }
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `${title}`,
          weight: 'bold',
          size: 'xl'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Price',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: `${amount} ${currency}`,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 5
                }
              ]
            }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          action: {
            type: 'uri',
            label: 'Pay with LINE Pay',
            uri: `${paymentWeb}`
          }
        },
        {
          type: 'spacer',
          size: 'sm'
        }
      ],
      flex: 0
    }
  }

  return {
    type: 'flex',
    altText: 'pay with line pay',
    contents: a
  }
}

export const reservePaymentHandler = (
  confirmUrl: string,
  p: Payment,
  cp: MessagingClientProvider,
  provider: PaymentClientProvider,
  paymentRepository: PaymentRepository
): ReservePaymentListener => {
  let log = newLogger()
  return async (payload: ReservePaymentMessage): Promise<void> => {
    let client: PaymentClient
    try {
      client = provider.get(payload.provider)
      if (!client) {
        console.log('payment client not found')
        //NC:TODO: handle failure case, reply to confirm payment channel
        return
      }
    } catch (err) {
      log.error(`payment client: ${err}`)
      return
    }

    let request: LineReservePaymentRequest = {
      productName: payload.productName,
      productImageUrl: payload.productImageUrl,
      amount: payload.amount,
      currency: payload.currency,
      orderId: payload.orderId,
      confirmUrl: confirmUrl,
      langCd: 'th' // payment screen language
    }

    // store to memcache
    await client
      .reserve(request)
      .then(async response => {
        let result: ReservePaymentResultMessage = {
          type: 'ReservePaymentResult',
          provider: 'linepay',
          isCompleted: false
        }
        console.log(response)
        if (response.returnCode != '0000') {
          console.error('failed to reserve payment: ', response)
          await p.confirmPayment(result)
          return
        }

        if (!response.info) {
          console.error('failed to reserve payment: ', response)
          await p.confirmPayment(result)
          return
        }
        result.transactionId = response.info.transactionId
        result.paymentUrl = response.info['paymentUrl']
          ? {
              web: response.info['paymentUrl'].web,
              app: response.info['paymentUrl'].app
            }
          : undefined

        const m = formatPaymentMessage(
          payload.productName,
          payload.productImageUrl ? payload.productImageUrl : '',
          payload.amount,
          payload.currency,
          response.info['paymentUrl'].web,
          response.info['paymentUrl'].app
        )
        console.log(`payload: ${JSON.stringify(m)}`)
        // HACK: to remove
        payload.source &&
          cp.get('line').sendCustomMessages({
            provider: 'line',
            replyToken: '',
            to: payload.source.userId,
            message: m
          })
        result.isCompleted = true
        await p.confirmPayment(result)
        return paymentRepository.push(response.info.transactionId, payload)
      })
      .catch(err => {
        log.error(`failed to reserve payment ${payload.orderId}: ${err}`)
      })

    //NC:TODO: handle failure case, reply to confirm payment channel
  }
}
