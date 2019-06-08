import { getFulfillmentDevelopmentConstant } from "../constants";

describe('constant test',() => {


  test('getFulfillmentDevelopmentConstant', () => {
    const constant = getFulfillmentDevelopmentConstant()
    expect(constant).toMatchSnapshot()
  })

})