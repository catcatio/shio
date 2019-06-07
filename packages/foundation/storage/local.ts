import { FileStorage } from './storage'
import * as path from 'path'
import * as fs from 'fs'

export class LocalFileStorage implements FileStorage {
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

  PutObject(key: string, data: Buffer): Promise<void> {
    let objPath = path.join(this.rootPath, key)

    return new Promise<void>((resolve, reject) => {
      fs.writeFile(objPath, data, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
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
