export interface FileStorage {
  GetObject(key: string): Promise<Buffer>
  PutObject(key: string, data: Buffer): Promise<void>
  RemoveObject(key: string): Promise<void>
  GetJSONObject<T>(key: string): Promise<T>
}
