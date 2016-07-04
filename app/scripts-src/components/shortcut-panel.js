const yo = require('yo-yo')
const Util = require('util')
const errorMessage = require('./error-message')
const pscommand = require('./util/pscommand')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const Path = require('path')
const throbber = require('./throbber')

module.exports = shortcutPanel
function shortcutPanel(shortcut) {
  let id
  let errHtml
  let obj

  load()

  function init(_id) {
    id = _id
  }

  async function load() {
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      let fullPathEncoded = new Buffer(fullPath, 'utf16le').toString('base64')
      let command = `
        $fullPathBinary = [Convert]::FromBase64String("${fullPathEncoded}")
        $fullPath = [System.Text.Encoding]::Unicode.GetString($fullPathBinary)
        (New-Object -ComObject WScript.Shell).CreateShortcut($fullPath) | ConvertTo-Json -Compress`
      obj = JSON.parse(await pscommand(command))
    }
    catch (err) {
      obj = err
    }
    updateObj()
  }

  function updateObj() {
    update(id, render())
  }

  function render() {
    let objHtml
    if (!obj) {
      objHtml = throbber()
    }
    else if (obj instanceof Error) {
      objHtml = errorMessage(obj)
    }
    else {
      let propertiesHtml = [
        ["Shortcut path", yo`<code>${obj.FullName}</code>`],
        ["Target path", yo`<code>${obj.TargetPath}</code>`],
        ["Description", obj.Description]
      ]
      objHtml = yo`
        <dl>
          ${propertiesHtml.map(([name, value]) => [
            yo`<dt>${name}</dt>`,
            yo`<dd>${value}</dd>`
          ])}
        </dl>
      `
    }
    return yo`
      <div class="mui-container">
        <h2>Properties</h2>
        <div class="mui-panel">
          ${objHtml}
        </div>
      </div>
    `
  }

  return connect(render, init)
}
