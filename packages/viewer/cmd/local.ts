
import { bootstrap } from '../server'

async function run() {
  await bootstrap("http://localhost:8080", 3000, "http://localhost:3000")
}

run()