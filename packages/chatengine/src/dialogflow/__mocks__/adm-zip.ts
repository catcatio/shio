const zip: any = jest.genMockFromModule('adm-zip')

let folderToZip = ''

zip.prototype.extractAllTo = jest.fn()
zip.prototype.addLocalFolder = jest.fn((pathToZip) => { folderToZip = pathToZip })
zip.prototype.toBuffer = jest.fn(() => Buffer.from(folderToZip))

export = zip