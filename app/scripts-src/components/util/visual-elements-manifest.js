const LTX = require('ltx')
const Path = require('path')
const FS = require('@jokeyrhyme/pify-fs')

const booleanConverter = {
  booleanToString(b) { return b ? 'on' : 'off' },
  stringToBoolean(s) { return s === 'on' }
}

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
    loadXml: {
      let vemPath = this.getVemPath()
      let stat
      try {
        stat = await FS.stat(vemPath)
      }
      catch (err) {
        this.xml = undefined
        break loadXml
      }

      if (!stat.isFile()) {
        this.xml = undefined
        break loadXml
      }

      let fileContents = await FS.readFile(vemPath)
      let xml = LTX.parse(fileContents)
      let ve = xml.getChild('VisualElements')
      if (!ve) {
        this.xml = undefined
        break loadXml
      }
      this.xml = xml
      let attrs = ve.attrs
      obj.bg = attrs.BackgroundColor
      obj.showfg =
        booleanConverter.stringToBoolean(attrs.ShowNameOnSquare150x150Logo)
      obj.fg = attrs.ForegroundText
    }
    if (!this.xml) {
      // load defaults into obj
      obj.bg = undefined
      obj.showfg = true
      obj.fg = 'light'
    }
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
    ve.attr('ForegroundText', obj.fg)
    ve.attr(
      'ShowNameOnSquare150x150Logo',
      booleanConverter.booleanToString(obj.showfg)
    )
    let vemPath = this.getVemPath()
    let xmlSerialized = xml.toString()
    await FS.writeFile(vemPath, xmlSerialized)
  }

  async remove(obj) {
    let vemPath = this.getVemPath()
    obj.bg = undefined
    obj.showfg = undefined
    obj.fg = undefined
    await FS.unlink(vemPath)
  }

}
