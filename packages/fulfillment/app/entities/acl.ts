import { CommonAttributes } from "./common";

export enum Permission {
  OWNER = 'OWNER',
  WRITER = 'WRITER',
  VIEWER = 'VIEWER'
}

export const SYSTEM_USER = 'system'
export const INTEGRATION_USER = 'integration'

export interface ACL extends CommonAttributes {
  // shio::book::list::*
  // shio::book::read::<book_id>
  id: string

  resourcePrefix: string
  resourceType: string
  resourceId: string

  userId: string
  permissions: Permission[]
  lastAccessed?: Date
}

export class ResourceTag {
  type: string
  id: string
  prefix: string
  constructor(option: { type: string; id: string; prefix: string }) {
    this.type = option.type
    this.id = option.id
    this.prefix = option.prefix
  }
  toString() {
    return `${this.prefix}::${this.type}::${this.id}`
  }
  withId(id: string){
    return new ResourceTag({
      ...this,
      id,
    })
  }
}

export function newResourceTag(resourceType: string, resourceId?: string | number): ResourceTag {
  return new ResourceTag({
    prefix: 'shio',
    type: resourceType,
    id: resourceId ? resourceId + '' : '*'
  })
}
