import { logger } from '../logger'

describe('Logger test', () => {
  it('should able to log', () => {
    const meta = {
      userId: 'N001',
      requestId: '888-AB8',
      fields: {
        something: 'FIELD_HERE'
      }
    }
    logger.withUserId(meta.userId).info('Hi')
  })
})
