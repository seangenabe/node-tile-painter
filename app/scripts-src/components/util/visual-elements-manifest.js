const LTX = require('ltx')
const Path = require('path')
const FS = require('@jokeyrhyme/pify-fs')

module.exports = class VisualElementsManifest {

  constructor(targetPath) {
    this.targetPath = targetPath
  }

  async load(obj) {
    let manifestBasename =
      `${Path.basename(this.targetPath, '.exe')}.visualelementsmanifest.xml`
    let vemPath = Path.join(this.targetPath, '..', manifestBasename)
    let stat
    try {
      stat = await FS.stat(vemPath)
    }
    catch (err) {
      return
    }

    if (!stat.isFile()) {
      return
    }

    let fileContents = await FS.readFile(vemPath)
    let xml = LTX.parse(fileContents)
    let ve = xml.getChild('VisualElements')
    if (!ve) {
      return
    }
    this.xml = xml
    obj.bg = ve.attrs.BackgroundColor
  }

}
