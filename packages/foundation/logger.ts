import { createLogger, transports, format } from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'



interface ShioLoggerMeta {
  userId?: string
  requestId?: string
  fields?: {[key: string]: string}
}
interface ShioLogger {
  info(message :string, ...meta: ShioLoggerMeta[]): void
  error(message: string)
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

  return createLogger({
    transports: loggerTransports,
    format: format.printf(info => {

      let requestId = ""
      if (typeof info.requestId === 'string') {
        requestId = `(${info.requestId})`
      }

      if (typeof info.userId === 'undefined') {
        info.userId = 'system'
      }

      if (typeof info.fields === 'undefined') {
        info.fields = {}
      }

      const fieldStr = Object.keys(info.fields).map(k => `${k}=${info.fields[k]}`).join(',')

      return `${new Date().toISOString()} | ${info.userId} ${requestId} | ${info.level.toUpperCase()} | ${info.message} | ${fieldStr} `
    })
  })
}
