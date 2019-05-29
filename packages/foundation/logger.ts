import { createLogger, transports, format, Logger } from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

interface ShioLoggerMeta {
  userId?: string
  requestId?: string
  fields?: { [key: string]: string }
}
export class ShioLogger {
  private logger: Logger
  private meta: ShioLoggerMeta
  constructor(logger: Logger, meta: ShioLoggerMeta = {}) {
    this.logger = logger
    this.meta = meta
  }
  withUserId(value: string): ShioLogger {
    return new ShioLogger(this.logger, {
      ...this.meta,
      userId: value
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
 * @SHIO_LOG_DISABLE_CONSOLE
 * @value 1 disable console logger
 *
 * @SHIO_LOG_TRANSPORT_STACKDRIVER
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
      let requestId = ''
      if (typeof info.requestId === 'string') {
        requestId = `(${info.requestId})`
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

      return `${new Date().toISOString()} | ${info.userId} ${requestId} | ${info.level.toUpperCase()} | ${info.message} | ${fieldStr} `
    })
  })
  return new ShioLogger(logger)
}
