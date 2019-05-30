import { createLogger, transports, format, Logger } from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'
import { MessageProvider } from './entities'

interface ShioLoggerMeta {
  userId?: string
  requestId?: string
  provider?: MessageProvider
  fields?: { [key: string]: string }
}
export class ShioLogger {
  private logger: Logger
  private meta: ShioLoggerMeta
  constructor(logger: Logger, meta: ShioLoggerMeta = {}) {
    this.logger = logger
    this.meta = meta
  }
  withFields(value: ShioLoggerMeta['fields']) {
    return new ShioLogger(this.logger, {
      ...this.meta,
      fields: value,
    })
  }
  withUserId(value: string): ShioLogger {
    return new ShioLogger(this.logger, {
      ...this.meta,
      userId: value
    })
  }
  withProviderName(value: MessageProvider): ShioLogger {
    return new ShioLogger(this.logger, {
      ...this.meta,
      provider: value
    })
  }
  withRequestId(value: string): ShioLogger {
    return new ShioLogger(this.logger, {
      ...this.meta,
      requestId: value
    })
  }
  info(message: string): void {
    this.logger.info(message, this.meta)
  }
  error(message: string) {
    this.logger.error(message, this.meta)
  }
}

export const logger = newLogger()

/**
 * Logger configuration
 *
 * Environment variables
 * @shio-bot_LOG_DISABLE_CONSOLE
 * @value 1 disable console logger
 *
 * @shio-bot_LOG_TRANSPORT_STACKDRIVER
 * @value 1 use stackdriver logging transport
 *
 */
export function newLogger(): ShioLogger {
  const loggerTransports: transports.ConsoleTransportInstance[] = []

  if (process.env['SHIO_LOG_DISABLE_CONSOLE'] !== '1') {
    loggerTransports.push(new transports.Console())
  }

  if (process.env['SHIO_LOG_TRANSPORT_STACKDRIVER'] === '1') {
    const stackdriverTransport = new LoggingWinston({})
    loggerTransports.push(stackdriverTransport)
  }
  const logger = createLogger({
    transports: loggerTransports,
    format: format.printf(info => {
      let requestId = '<no-request-id>'
      if (typeof info.requestId === 'string') {
        requestId = `${info.requestId}`
      }

      if (typeof info.userId === 'undefined') {
        info.userId = 'system'
      }

      if (typeof info.fields === 'undefined') {
        info.fields = {}
      }

      const fieldStr = Object.keys(info.fields)
        .map(k => `${k}=${info.fields[k]}`)
        .join(',')

      return [new Date().toDateString(), requestId, info.provider, info.userId, info.level.toUpperCase(), info.message, fieldStr].join(' | ')
    })
  })
  return new ShioLogger(logger)
}
