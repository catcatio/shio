import { Storage, Bucket, StorageOptions } from '@google-cloud/storage'
import { FileStorage } from './storage'

export class GCPFileStorage implements FileStorage {
  private bucket: Bucket
  constructor(bucketName: string, options?: StorageOptions) {
    let storage = new Storage(options)
    this.bucket = storage.bucket(bucketName)
  }
  GetObject(key: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let fileStream = this.bucket.file(key).createReadStream()
      let chunks: any[] = []

      fileStream
        .once('error', err => {
          reject(err)
        })
        .once('end', () => {
          resolve(Buffer.concat(chunks))
        })
        .on('data', chunk => {
          chunks.push(chunk)
        })
    })
  }
  PutObject(key: string, data: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let fileStream = this.bucket.file(key).createWriteStream()

      fileStream
        .once('error', err => {
          reject(err)
        })
        .once('end', () => {
          resolve()
        })
        .end(data)
    })
  }

  async RemoveObject(key: string): Promise<void> {
    await this.bucket.file(key).delete()
  }

  async GetJSONObject<T>(key: string): Promise<T> {
    const data = await this.GetObject(key)
    return JSON.parse(data as any) as T
  }
}
