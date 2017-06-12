const LTX = require('ltx')
const Path = require('path')
const FS = require('mz/fs')
const globby = require('globby')
const bumpFile = require('./bump-file')
const tempy = require('tempy')
const commandJoin = require('command-join')
const Elevator = require('elevator')
const updateProgramVem = require('./update-program-vem')
const pathToElectron = require('electron-prebuilt-path')

const booleanConverter = {
  booleanToString(b) { return b ? 'on' : 'off' },
  stringToBoolean(s) { return s === 'on' }
}

// Visual elements manifest:
// https://msdn.microsoft.com/en-us/library/windows/apps/dn393983.aspx

module.exports = class VisualElementsManifest {

  constructor(shortcutPath, targetPath) {
    this.targetPath = targetPath
    this.shortcutPath = shortcutPath
    this.xml = undefined
  }

  async getVemPath() {
    // case-insensitive basename
    let targetBasename = Path.basename(this.targetPath.replace(/\.exe$/i, ''))
    let manifestBasename = `${targetBasename}.visualelementsmanifest.xml`
    let vemPath = Path.join(this.targetPath, '..', manifestBasename)
    try {
      let result = await globby([vemPath])
      if (result[0]) {
        vemPath = result[0]
      }
    }
    catch (err) {}
    return vemPath
  }

  async load(obj) {
    loadXml: {
      let vemPath = await this.getVemPath()
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
      if (attrs.Square150x150Logo) {
        let logoPath = Path.join(this.targetPath, '..', attrs.Square150x150Logo)
        try {
          await FS.stat(logoPath)
          obj.img = await FS.readFile(logoPath)
        }
        catch (err) {
          // Error occured while loading image.
          // Just ignore the referenced image.
        }
      }
    }
    if (!this.xml) {
      // load defaults into obj
      obj.bg = undefined
      obj.showfg = true
      obj.fg = 'light'
      obj.img = undefined
    }
  }

  async save(obj) {
    if (!this.xml) {
      this.xml = LTX.parse(
        `<Application xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><VisualElements/></Application>`
      )
    }
    let { xml } = this
    let { img } = obj
    let ve = xml.getChild('VisualElements')
    ve.attr('BackgroundColor', obj.bg)
    ve.attr('ForegroundText', obj.fg)
    ve.attr(
      'ShowNameOnSquare150x150Logo',
      booleanConverter.booleanToString(obj.showfg)
    )
    if (img) {
      let imgPath = Path.join(this.targetPath, '..', 'tile.png')
      await FS.writeFile(imgPath, img)
      ve.attr('Square150x150Logo', 'tile.png')
      ve.attr('Square70x70Logo', 'tile.png')
    }
    let vemPath = await this.getVemPath()
    let xmlSerialized = xml.toString()

    try {
      await updateProgramVem(vemPath, xmlSerialized, this.shortcutPath)
    }
    catch (err) {
      if (err.code !== 'EPERM') {
        throw err
      }
      let tmpFn = tempy.file({ extension: '.png'})
      await FS.writeFile(tmpFn, xmlSerialized)
      const args = [
        `${__dirname}/update-program-vem`,
        vemPath,
        tmpFn,
        this.shortcutPath
      ]
      await new Promise((resolve, reject) => {
        const cb = (err, stdout, stderr) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        }
        Elevator.execute([pathToElectron, ...args], {}, cb)
      })
    }
  } // async save

  async remove(obj) {
    let vemPath = await this.getVemPath()
    obj.bg = undefined
    obj.showfg = undefined
    obj.fg = undefined
    obj.img = undefined
    await FS.unlink(vemPath)
  }

}
