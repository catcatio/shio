import * as fs from 'fs-extra'
import * as zip from 'adm-zip'
import { AgentsClient } from 'dialogflow'
import { DefaultDialogFlowAdmin } from '../admin'

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())

describe('exportAgent function', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('success', async () => {
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id', 'fake-path')
    await admin.ExportAgent()
    expect(fs.existsSync).toHaveBeenCalledTimes(2)
    expect(fs.mkdirSync).toHaveBeenCalled()
    expect(fs.removeSync).not.toHaveBeenCalled()
    expect(AgentsClient.prototype.exportAgent).toHaveBeenCalledWith({ parent: 'projects/fake-project-id' })
    expect(zip.prototype.extractAllTo).toHaveBeenCalled()
  })

  it('failed, folderPath is not set', async () => {
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id')
    await expect(admin.ExportAgent()).rejects.toThrow()
  })

  it('failed, no result from dialogflow api', async () => {
    ;(AgentsClient.prototype.exportAgent as any) = jest.fn().mockResolvedValueOnce([])
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id', 'fake-path')
    await expect(admin.ExportAgent()).rejects.toThrow()
  })

  it('failed, result from dialogflow api is wrong format', async () => {
    ;(AgentsClient.prototype.exportAgent as any) = jest.fn().mockResolvedValueOnce([{ result: { agentContens: '' } }])
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id', 'fake-path')
    await expect(admin.ExportAgent()).rejects.toThrow()
  })
})
