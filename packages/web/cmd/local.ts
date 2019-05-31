import { bootstrap } from '../app/bootstrap'
import { Configurations } from '../app/types'

function loadConfig(): Configurations {
  let config: Configurations = require('./config.local')

  return config
}

async function run() {
  let config = loadConfig()
  await bootstrap(config)
}

run()
