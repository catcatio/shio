import { ParsedPath } from "path";


export interface FileStorageObject {
  path: ParsedPath
  href: string
}

export interface FileStorage {
  GetObject(key: string): Promise<Buffer>
  PutObject(key: string, data: Buffer): Promise<FileStorageObject>
  RemoveObject(key: string): Promise<void>
  GetJSONObject<T>(key: string): Promise<T>
  GetObjectUrl(key: string): Promise<string>
}
