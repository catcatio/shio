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
  static fromAclable(v: {aclTag: string}){
    return ResourceTag.fromAclTag(v.aclTag)
  }
  static fromAclTag(v: string) {
    const seq = v.split("::")
    const tag = new ResourceTag({
      prefix: seq[0],
      type: seq[1],
      id: seq[2],
    })
    return tag
  }
  constructor(option: { type: string; id: string; prefix: string }) {
    this.type = option.type
    this.id = option.id
    this.prefix = option.prefix
  }
  toString() {
    return `${this.prefix}::${this.type}::${this.id}`
  }
  withId(id: string) {
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
