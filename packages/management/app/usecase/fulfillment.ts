import { newLogger, FileStorage } from "@shio-bot/foundation";
import { AssetRepository, WithPagination } from "../../../fulfillment/app";
import { CreateBookAssetInput, CreateBookAssetOutput, ListBookAssetInput, ListBookAssetOutput } from "../../__generated__/fulfillment_pb";
import { join } from "path";
import { AssetMetadataBookKind } from "@shio-bot/foundation/entities";
const nanoid = require('nanoid')

const unzipper = require('unzipper')
type UnzipResult = {
  files: {
    path: string,
    buffer: () => Promise<Buffer>
    type: 'Directory' | 'File'
  }[]
}
async function unzip(value: Buffer): Promise<UnzipResult> {
  const directory = await unzipper.Open.buffer(value)
  return directory
}

async function getFileNameFromZipOrThrow(zip: Buffer, fileName: string): Promise<Buffer> {
  const contents = await unzip(zip)
  const pdfContent = contents.files.find(f => f.path === 'content.pdf')
  if (!pdfContent) {
    throw new Error(fileName + " not found in package")
  }
  const pdfBuffer = await pdfContent.buffer()
  return pdfBuffer
}

export class FulfillmentManagerUseCase {


  private Asset: AssetRepository
  private Storage: FileStorage
  private log = newLogger().withUserId("shio-management")
  private BookAssetFileNames = ['content.pdf', 'cover.jpg']

  constructor(Asset: AssetRepository, Storage: FileStorage){
    this.Asset = Asset
    this.Storage = Storage
  }

  async listBookAsset(input: ListBookAssetInput): Promise<ListBookAssetOutput> {
    const assets = await this.Asset.findMany(
      WithPagination(input.getLimit(),input.getOffset())
    )
    const output = new ListBookAssetOutput()
    output.setRecordsList(assets.records.map(a => {
      const v = new ListBookAssetOutput.BookAssetItem()
      v.setDescribeurl(a.describeURL)
      v.setId(a.id)
      v.setTitle(a.meta.title)
      return v
    }))
    return output
  }

  async createBookAsset(input: CreateBookAssetInput, log = this.log): Promise<CreateBookAssetOutput> {
    const zipFileBuffer = Buffer.from(input.getSource(), 'base64')

    log.info("create new book asset record....")
    const id = nanoid(10)
    log.info('generate ID '+ id)

    const describePath = join("${bucketName}/assets/books", id)
    const result = await this.Asset.create({
      id,
      describeURL: "gs://" + describePath,
      meta: {
        kind: AssetMetadataBookKind,
        coverImageURL: "gs://" + describePath + "/cover.jpg",
        description: input.getDescription(),
        teaser: input.getTeaser(),
        title: input.getTitle(),
        slug: input.getSlug()
      },
    })

    const requireFileBuffers = await Promise.all(this.BookAssetFileNames.map(async f => {
      const buf = await getFileNameFromZipOrThrow(zipFileBuffer, f)
      return {
        f, buf
      }
    }))

    log.info("upload book asset source....")
    await this.Storage.PutObject(join(describePath, "source.zip"), zipFileBuffer)

    await Promise.all(requireFileBuffers.map(async ({ f, buf }) => {
      log.info('upload ' + f)
      await this.Storage.PutObject(join(describePath, f), buf)
    }))

    log.info("Upload complete, writing a record of asset...")

    const output = new CreateBookAssetOutput()
    output.setId(result.id)
    return output

  }
}