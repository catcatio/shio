import { join } from "path";
import config from './next.config'
const nextBuild = require('next/dist/build').default
process.env.NODE_ENV = 'development'
nextBuild(join(__dirname, "."), config)
.then(() => {
    console.log('Build complete')
})