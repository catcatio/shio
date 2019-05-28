
import { Datastore, Query } from "@google-cloud/datastore";
import { entity } from "@google-cloud/datastore/build/src/entity";
import { RepositoryOptions } from "../repositories";

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

function addFilter(Query: Query, key: string, value: any, op: string) {
  switch (typeof value) {
    case 'string':
      // Apply string filter
      switch (op) {
        case 'Equal':
          Query = Query.filter(key, '=', value)
          break
        case 'NotEqual':
          Query = Query.filter(key, '<', value)
          Query = Query.filter(key, '>', value)
          break
      }
      break
  }
  return Query
}

export function applyFilter(Query: Query, option: RepositoryOptions): Query {
  option.where.forEach(condition => {
    Object.keys(condition).forEach(k => {
      const attr = condition[k]
      if (!attr) {
        return
      }
      Object.keys(attr).forEach(op => {
        const v = attr[op]
        switch (typeof v) {
          case 'object':
            // Apply nested object filter
            Object.keys(v).forEach(nestedKey => {
              const nestedValue = v[nestedKey]
              Query = addFilter(Query, [k, nestedKey].join('.'), nestedValue, op)
            })
            break
          default:
            Query = addFilter(Query, k, v, op)
            break
        }
      })
    })
  })
  return Query
}