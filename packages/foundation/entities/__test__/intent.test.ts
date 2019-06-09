import { validateMessageIntent } from "../intent";
import { randomFollowMessageIntent, randomListItemEventMessageIntent } from "./random";

describe('intent testing', () => {
  test('validate valid intent', () => {
    {
      const intent = randomFollowMessageIntent()
      const { value, error } = validateMessageIntent(intent)
      expect(error).toBeNull()
      expect(value).toEqual(intent)
    }
    {
      const intent = randomListItemEventMessageIntent()
      const { value, error } = validateMessageIntent(intent)
      expect(error).toBeNull()
      expect(value).toEqual(intent)
    }
  })

  test('validate invalid intent', () => {
    const { error } = validateMessageIntent({
      name: 'dobedobedo'
    })
    expect(error).toBeDefined()

  })
})