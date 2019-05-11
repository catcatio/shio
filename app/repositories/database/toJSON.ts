import { Datastore } from "@google-cloud/datastore";
import { entity } from "@google-cloud/datastore/build/src/entity";

export function toJSON(entity: any) {
  if (typeof entity === 'undefined' || !entity) {
    return undefined
  }
  const { [Datastore.KEY]: key , ...data} = entity
  const k: entity.Key = key
  const id = k.name || k.id
  return {
    id,
    ...data
  }
}