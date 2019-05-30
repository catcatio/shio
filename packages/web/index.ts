import { server } from './server'
import { Configurations } from './types';

let config: Configurations = require('./config.json')

server(config)
  .start()
  .then(_ => console.log('D O N E'))
  .catch(err => console.error(err))
