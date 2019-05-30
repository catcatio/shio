import { ParsedMessage, Intent, empty, IntentDetector } from "../types";

export class IntentEngine {
  constructor(private detector: IntentDetector) {
  }

  detect(message: ParsedMessage): Intent | empty {
    return this.detect(message)
  }
}


