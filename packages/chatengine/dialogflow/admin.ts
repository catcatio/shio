import { ClientOptions, AgentsClient, IntentsClient } from 'dialogflow'
import { ExportedAgent, empty } from '../types'

import * as AdmZip from 'adm-zip'
import * as fs from 'fs-extra'

export interface DialogFlowAdmin {
  ExportAgent(): Promise<void>
  ImportAgent(): Promise<void>
}

export class DefaultDialogFlowAdmin implements DialogFlowAdmin {
  constructor(private clientOption: ClientOptions, private projectId: string, private folderPath?: string) {}

  async ExportAgent(): Promise<void> {
    if (!this.folderPath) {
      throw new Error('folder path does not set, please set it before use this command')
    }

    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath)
    }

    console.log('start export agent')
    const agentClient = new AgentsClient(this.clientOption)
    const [operation] = await agentClient.exportAgent({ parent: `projects/${this.projectId}` })
    console.log('get response from exportAgent success')

    const convertedAgent = this.convertToExportAgentResponse(operation)
    if (!convertedAgent) {
      throw new Error('cannot get agentContent from dialogflow')
    }

    const exportAgent = `${this.folderPath}/${this.projectId}`
    if (fs.existsSync(exportAgent)) {
      fs.removeSync(exportAgent)
    }

    const zip = new AdmZip(convertedAgent.agentContent)
    zip.extractAllTo(`${exportAgent}`)
    console.log(`extract zip file from response to folder ${exportAgent}`)
    console.log('export agent completed')
  }

  async ImportAgent(): Promise<void> {
    if (!this.folderPath) {
      throw new Error('folder path does not set, please set it before use this command')
    }

    const importAgent = `${this.folderPath}/${this.projectId}`
    if (!fs.existsSync(importAgent)) {
      throw new Error(`agent folder does not exist, folder: ${importAgent}`)
    }

    console.log('start import agent')
    const agentClient = new AgentsClient(this.clientOption)
    const zip = new AdmZip()
    zip.addLocalFolder(`${importAgent}`)

    const agentContent = zip.toBuffer().toString('base64')
    await agentClient.importAgent({ parent: `projects/${this.projectId}`, agentContent })
    console.log('import agent completed')
  }

  private convertToExportAgentResponse(operation: any): ExportedAgent | empty {
    if (!operation) {
      return
    }
    if (!operation.result) {
      return
    }
    if (!operation.result.agentContent) {
      return
    }
    return { agentContent: operation.result.agentContent }
  }
}
