import { FileStorage, FileStorageObject } from './storage'
import * as path from 'path'
import * as fs from 'fs'

export class LocalFileStorage implements FileStorage {

  GetObjectUrl(key: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  constructor(public rootPath: string = '') {}

  GetObject(key: string): Promise<Buffer> {
    let objPath = path.join(this.rootPath, key)
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(objPath, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        resolve(data)
      })
    })
  }

  PutObject(key: string, data: Buffer): Promise<FileStorageObject> {
    let objPath = path.join(this.rootPath, key)

    return new Promise<FileStorageObject>((resolve, reject) => {
      fs.writeFile(objPath, data, err => {
        if (err) {
          reject(err)
          return
        }
        const pathInfo = path.parse(path.join(objPath))
        const uri = new URL(`file://${objPath}`)
        resolve({
          path: pathInfo,
          href: uri.href, 
        })
      })
    })
  }
  RemoveObject(key: string): Promise<void> {
    let objPath = path.join(this.rootPath, key)
    return new Promise<void>((resolve, reject) => {
      fs.unlink(objPath, err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  async GetJSONObject<T>(key: string): Promise<T> {
    let data = await this.GetObject(key)
    return JSON.parse(data as any) as T
  }
}
