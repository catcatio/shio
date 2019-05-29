import { bootstrap } from "../app";

export type UnPromise<T> = T extends Promise<infer U> ? U : T

declare global {
  module NodeJS {
    interface Global {
      app: UnPromise<ReturnType<typeof bootstrap>>
    }
  }
}
