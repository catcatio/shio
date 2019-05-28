import { SYSTEM_USER, newResourceTag, Permission } from './entities';
import { WithSystemOperation, DatastoreACLRepository } from './repositories';

export async function prepare(acl: DatastoreACLRepository) {
  // Prepare for instance to boot....
}