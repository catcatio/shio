import { logger } from "../logger";



describe('Logger test', ()=> {

  it('should able to log', () => {
    logger.info("Hi", {
      userId: 'N001',
      requestId: '888-AB8',
      fields: {
        something:"FIELD_HERE"
      }
    })
  })

})