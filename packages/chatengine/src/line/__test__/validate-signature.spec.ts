import validateSignature from '../validate-signature';

const body = { hello: 'world' };
const secret = 'test_secret';

describe('validateSignature test', () => {
  it('success', () => {
    const validSignature = 't7Hn4ZDHqs6e+wdvI5TyQIvzie0DmMUmuXEBqyyE/tM=';
    expect(validateSignature(JSON.stringify(body), secret, validSignature)).toEqual(true);
  });

  it('failure', () => {
    const invalidSignature = 't7Hn4ZDHqs6e+wdvi5TyQivzie0DmMUmuXEBqyyE/tM=';
    expect(validateSignature(JSON.stringify(body), secret, invalidSignature)).toEqual(false);
  });
});