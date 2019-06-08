import { join } from "path";
import yaml = require('js-yaml');
import fs = require('fs');

export function getFulfillmentDevelopmentConstant() {
  var doc = yaml.safeLoad(fs.readFileSync(join(__dirname, '../../env.example.yaml'), 'utf8'));
  return {
    datastoreNamespace: doc.env_variables.SHIO_FULFILLMENT_DATASTORE_NAMESPACE,
    projectId: doc.env_variables.SHIO_FULFILLMENT_PROJECT_ID,
    storageName: doc.env_variables.SHIO_FULFILLMENT_STORAGE_NAME,
  }
}