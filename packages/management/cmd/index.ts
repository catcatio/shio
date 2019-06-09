import program from 'commander'
import { lstatSync, readFileSync } from 'fs';
import { join, isAbsolute } from 'path';
import { CreateBookAssetInput, ListBookAssetInput, CreateBookAssetOutput } from '../__generated__/fulfillment_pb';
import { credentials } from 'grpc';
import { FulfillmentManagerClient } from '../__generated__/fulfillment_grpc_pb';
import Table from 'cli-table'

const tableStyle = {
  chars: {
    'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
    , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
    , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
    , 'right': '', 'right-mid': '', 'middle': ' '
  },
  style: { 'padding-left': 0, 'padding-right': 0 }
}

function isFileOrExit(value: string): string {
  if (!isAbsolute(value)) {
    value = join(process.cwd(), value)
  }

  let status = lstatSync(value)
  if (!status.isFile()) {
    console.error("error: -f should be file path")
    process.exit(2)
  }
  return value
}

console.log('...')
program
  .command('asset <type> <action>')
  .option('-e --endpoint <value>', 'endpoint of service', 'localhost:9199')
  .option('-t, --title <type>', 'asset title')
  .option('-d, --desc <type>', 'asset description')
  .option('-f, --file <value>', 'file of asset')
  .option('-e --endpoint <value>', 'endpoint of service', 'localhost:9199')
  .option("--limit <value>", "limit of page", 10)
  .option("--offset <value>", "offset of page", 0)
  .action((type, action, options) => {
    const conn = new FulfillmentManagerClient(options.endpoint, credentials.createInsecure())
    if (type === 'book' && action === 'add') {

      const p = isFileOrExit(options.file)
      const request = new CreateBookAssetInput()
      const fileBuf = readFileSync(p)
      request.setSource(fileBuf.toString('base64'))
      request.setTitle(options.title)
      request.setDescription(options.desc)

      const call = conn.createBookAsset(request)
      call.on('data', (res: CreateBookAssetOutput) => {
        console.log(res.getMessage())
      })

    } else if (type === 'book' && action === 'list') {
      const request = new ListBookAssetInput()
      request.setLimit(options.limit)
      request.setOffset(options.offset)
      conn.listBookAsset(request, (err, resp) => {
        if (err) {
          console.error(err)
          process.exit(2)
        }
        var table = new Table({
          ...tableStyle,
          head: ['ID', 'Title', 'Description'], colWidths: [10, 18, 48]
        });

        resp.getRecordsList().forEach(record => {
          table.push([record.getId(), record.getTitle(), record.getDescription()])
        })
        console.log(table.toString())
      })
    }
  })


program
  .command('pubsub')
  .arguments('<cmd>').action((arg) => {



  })
program.parse(process.argv)