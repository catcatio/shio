import { Storage, Bucket, StorageOptions } from '@google-cloud/storage'
import { FileStorage, FileStorageObject } from './storage'
import { join, parse } from 'path';

export class GCPFileStorage implements FileStorage {

  async GetObjectUrl(key: string): Promise<string> {
    const [url] = await this.bucket.file(key).getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 1000 * 60),
    })
    return url
  }
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
  PutObject(key: string, data: Buffer): Promise<FileStorageObject> {
    return new Promise<FileStorageObject>((resolve, reject) => {
      let fileStream = this.bucket.file(key).createWriteStream()
      fileStream
        .once('error', err => {
          console.error(err)
          reject(err)
        })
        .on('finish', () => {
          const pathInfo = parse(key)
          const uri = new URL(`gs://${join(this.bucket.name, key)}`)
          resolve(
            {
              path: pathInfo,
              href: uri.href,
            }
          )
        })
        .end(data, () => { })
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
