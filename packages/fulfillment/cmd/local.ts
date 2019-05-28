import { bootstrap } from "../app";


async function run() {
  await bootstrap({
    datastoreEndpoint: "http://localhost:5545",
    datastoreNamespace: "catcat",
    projectId:"catcat-local",
    pubsubEndpoint: "http://localhost:8085"
  }) 
}

run()