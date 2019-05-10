
enum Permission {
  OWNER,
  WRITER,
  VIEWER,
}

interface ACL {

  // shio::book::list::*
  // shio::book::read::<book_id>
  tag: string
  permissions: Permission[]
  userId: string
  lastAccessed: Date
}

