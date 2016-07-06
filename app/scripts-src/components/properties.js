const throbber = require('./throbber')
const yo = require('yo-yo')
const psencode = require('./util/psencode')
const update = require('throw-down/update')(yo.update)
const connect = require('throw-down/connect')
const Path = require('path')
const pscommand = require('./util/pscommand')
const errorMessage = require('./error-message')
const VisualElementsManifest = require('./util/visual-elements-manifest')

module.exports = function shortcutProperties(shortcut, props) {
  let obj
  let id
  load()

  function init(_id) {
    id = _id
  }

  async function load() {
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      let command = `
        $fn = ${psencode(fullPath)}
        $s = (New-Object -ComObject WScript.Shell).CreateShortcut($fn)
        $s | ConvertTo-Json -Compress
      `
      obj = JSON.parse(await pscommand(command))

      // visual elements manifest
      let vem = new VisualElementsManifest(obj.TargetPath)
      await vem.load(props)
      props.vem = vem
    }
    catch (err) {
      obj = err
    }
    update(id, render())
  }

  function render() {
    let objHtml
    if (!obj) {
      objHtml = throbber()
    }
    else if (obj instanceof Error) {
      objHtml = errorMessage(obj, 'shortcut properties')
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
      <div class="mui-panel">
        ${objHtml}
      </div>
    `
  }

  return connect(render, init)
}
