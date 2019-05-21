const ora = require('ora')
import fetch from 'node-fetch'

const DATASTORE_LOCAL_ENDPOINT = 'http://localhost:5545'
const PUBSUB_LOCAL_ENDPOINT = 'http://localhost:8085'
function wait(n: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), n)
  })
}

async function checkDatastoreServer(retryNumber = 1, spinner?) {
  const text = 'Checking Cloud Datastore local @' + DATASTORE_LOCAL_ENDPOINT
  if (!spinner) {
    spinner = ora(text)
    spinner.start()
  }
  try {
    const resp = await fetch(DATASTORE_LOCAL_ENDPOINT)
    if (resp.status !== 200) {
      // Do retry if response is not 200
    }
  } catch (e) {
    spinner.start(`${text} (retry ${retryNumber++})`)
    if (retryNumber > 5) {
      spinner.fail(`Local datastore not available please check ${DATASTORE_LOCAL_ENDPOINT} and try again (see readme.md)`)
      process.exit(2)
    }
    await wait(1000)
    await checkDatastoreServer(retryNumber, spinner)
  }
  spinner.succeed("CloudDatastore is ready")
  return
}

async function checkPubsubServer(retryNumber = 1, spinner?) {
  const text = 'Checking CloudPubsub local @' + PUBSUB_LOCAL_ENDPOINT
  if (!spinner) {
    spinner = ora(text)
    spinner.start()
  }
  try {
    const resp = await fetch(PUBSUB_LOCAL_ENDPOINT)
    if (resp.status !== 200) {
      // Do retry if response is not 200
    }
  } catch (e) {
    spinner.start(`${text} (retry ${retryNumber++})`)
    if (retryNumber > 5) {
      spinner.fail(`CloudPubsub local not available please check ${PUBSUB_LOCAL_ENDPOINT} and try again (see readme.md)`)
      process.exit(2)
    }
    await wait(1000)
    await checkDatastoreServer(retryNumber, spinner)
  }
  spinner.succeed("CloudPubsub is ready")
  return
}

export default async function() {
  console.log('========= Setting up integration environment =========')
  await checkDatastoreServer(1)
  await checkPubsubServer(1)
}
