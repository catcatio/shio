import { NextConfig } from 'next'

let config: NextConfig = { }

if (process.env.NODE_ENV === 'development') {
  console.log('Build application with typescript config....')

  const withTypescript = require('@zeit/next-typescript')
  config = withTypescript(config)

  const withSass = require('@zeit/next-sass')
  config = withSass(config)
}

export default config
