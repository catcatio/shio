const { AgentsClient }: any = jest.genMockFromModule('dialogflow')

const mockExportAgent = jest.fn().mockResolvedValue([{ result: { agentContent: Buffer.from('agentContent') } }])
const mockImportAgent = jest.fn().mockResolvedValue([])

AgentsClient.prototype.exportAgent = mockExportAgent
AgentsClient.prototype.importAgent = mockImportAgent

export { AgentsClient }
