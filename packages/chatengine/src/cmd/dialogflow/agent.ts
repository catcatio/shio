#!/usr/bin/env node

import * as yargs from 'yargs'
import { DefaultDialogFlowAdmin, DialogFlowAdmin } from '../../dialogflow/admin';

yargs
  .command(
    'export',
    'Export Dialogflow agent',
    {
      keyFilename: {
        alias: 'k',
        describe: 'GCP credentials file',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      },
      projectId: {
        alias: 'p',
        describe: 'GCP ProjectID',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      },
      exportDir: {
        alias: 'd',
        describe: 'Exporting agent directory',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      }
    },
    async opts => {
      const dialogflowAdmin: DialogFlowAdmin = new DefaultDialogFlowAdmin(
        { keyFilename: opts.keyFilename }, opts.projectId, opts.exportDir,
      )
      await dialogflowAdmin.ExportAgent().catch(err => console.error(err.message))
    },
  ).command(
    'import',
    'Import Dialogflow agent',
    {
      keyFilename: {
        alias: 'k',
        describe: 'GCP credentials file',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      },
      projectId: {
        alias: 'p',
        describe: 'GCP ProjectID',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      },
      importDir: {
        alias: 'd',
        describe: 'Importing agent directory',
        demandOption: true,
        requiresArg: true,
        type: 'string',
        nargs: 1
      }
    },
    async opts => {
      const dialogflowAdmin: DialogFlowAdmin = new DefaultDialogFlowAdmin(
        { keyFilename: opts.keyFilename }, opts.projectId, opts.importDir,
      )
      await dialogflowAdmin.ImportAgent().catch(err => console.error(err.message))
    },
  )
  .version('0.0.1')
  .wrap(120)
  .recommendCommands()
  .help()
  .strict()
  .argv