
import { bootstrap } from '../server'
import { GetEnvString } from '@shio-bot/foundation';

async function run() {
  const host = GetEnvString("SHIO_HOST", "http://localhost:3000")
  console.log('Run with host = ' + host)
  await bootstrap("http://localhost:8080", 3000, host)
}

run()