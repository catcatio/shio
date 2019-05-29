const fs: any = jest.genMockFromModule('fs-extra')

let mockPaths: string[] = []

function __setMockPaths(newMockPaths: string[]) {
  newMockPaths.forEach(p => mockPaths.push(p))
}

fs.__setMockPaths = __setMockPaths
fs.mockPaths = mockPaths
fs.existsSync = jest.fn((directoryPath) => mockPaths.indexOf(directoryPath) != -1)
fs.mkdirSync = jest.fn((directoryPath) => mockPaths.push(directoryPath))

export = fs