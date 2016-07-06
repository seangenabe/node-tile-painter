const LTX = require('ltx')
const Path = require('path')
const FS = require('@jokeyrhyme/pify-fs')

// Visual elements manifest:
// https://msdn.microsoft.com/en-us/library/windows/apps/dn393983.aspx

module.exports = class VisualElementsManifest {

  constructor(targetPath) {
    this.targetPath = targetPath
    this.xml = undefined
  }

  getVemPath() {
    let manifestBasename =
      `${Path.basename(this.targetPath, '.exe')}.visualelementsmanifest.xml`
    return Path.join(this.targetPath, '..', manifestBasename)
  }

  async load(obj) {
    let vemPath = this.getVemPath()
    let stat
    try {
      stat = await FS.stat(vemPath)
    }
    catch (err) {
      this.xml = undefined
      return
    }

    if (!stat.isFile()) {
      this.xml = undefined
      return
    }

    let fileContents = await FS.readFile(vemPath)
    let xml = LTX.parse(fileContents)
    let ve = xml.getChild('VisualElements')
    if (!ve) {
      this.xml = undefined
      return
    }
    this.xml = xml
    let attrs = ve.attrs
    obj.bg = attrs.BackgroundColor
    obj.showfg =
      booleanConverter.stringToBoolean(attrs.ShowNameOnSquare150x150Logo)
  }

  async save(obj) {
    if (!this.xml) {
      this.xml = LTX.parse(
        `<Application xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><VisualElements/></Application>`
      )
    }
    let { xml } = this
    let ve = xml.getChild('VisualElements')
    ve.attr('BackgroundColor', obj.bg)
    let vemPath = this.getVemPath()
    let xmlSerialized = xml.toString()
    await FS.writeFile(vemPath, xmlSerialized)
  }

}

const booleanConverter = {
  booleanToString(b) { return b ? 'on' : 'off' },
  stringToBoolean(s) { return s === 'on' }
}
