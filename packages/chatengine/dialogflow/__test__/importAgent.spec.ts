import * as fs from 'fs-extra'
import * as zip from 'adm-zip'
import { AgentsClient } from 'dialogflow'
import { DefaultDialogFlowAdmin } from '../admin'

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())

describe('importAgent function', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    const MOCK_FOLDER_PATHS = ['exist-path/fake-project-id']
    ;(fs as any).__setMockPaths(MOCK_FOLDER_PATHS)
  })

  it('success', async () => {
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id', 'exist-path')
    await admin.ImportAgent()
    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(AgentsClient.prototype.importAgent).toHaveBeenCalled()
    expect(zip.prototype.addLocalFolder).toHaveBeenCalled()
  })

  it('failed, folderPath is not set', async () => {
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id')
    await expect(admin.ImportAgent()).rejects.toThrow()
  })

  it('failed, folderPath does not exist', async () => {
    ;(AgentsClient.prototype.exportAgent as any) = jest.fn().mockResolvedValueOnce([])
    const admin = new DefaultDialogFlowAdmin({}, 'fake-project-id', 'fake-path')
    await expect(admin.ImportAgent()).rejects.toThrow()
  })
})
