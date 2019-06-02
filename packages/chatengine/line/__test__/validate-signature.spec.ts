import { default as validateSignature, makeSignature } from '../validate-signature'

const body = { hello: 'world' }
const secret = 'test_secret'

describe('validateSignature test', () => {
  it('should return true, for match signature', () => {
    const validSignature = 't7Hn4ZDHqs6e+wdvI5TyQIvzie0DmMUmuXEBqyyE/tM='
    expect(validateSignature(JSON.stringify(body), secret, validSignature)).toEqual(true)
  })

  it('should return false, for mismatch signature', () => {
    const invalidSignature = 'some_other_signture'
    expect(validateSignature(JSON.stringify(body), secret, invalidSignature)).toEqual(false)
  })
})

describe('makeSignature test', () => {
  it('should return expected signature', () => {
    const expectedSignature = 't7Hn4ZDHqs6e+wdvI5TyQIvzie0DmMUmuXEBqyyE/tM='
    expect(makeSignature(JSON.stringify(body), secret)).toEqual(expectedSignature)
  })
})
