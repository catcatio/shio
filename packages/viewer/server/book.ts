
import { FileStorage } from '@shio-bot/foundation'
import { AssetMetadataBook } from '@shio-bot/foundation/entities';


export class BookResolver {

  private storage: FileStorage

  constructor(storage: FileStorage) {
    this.storage = storage
  }

  public getBookDownloadableUrl(asset: AssetMetadataBook) {

  }
}