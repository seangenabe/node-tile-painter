const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const errorMessage = require('./error-message')
const Path = require('path')
const getFileInfo = require('./util/get-file-info')
const throbber = require('./throbber')
const getThemeColor = require('./util/get-theme-color')

module.exports = shortcutPreview
function shortcutPreview(shortcut, props) {
  let icon
  let id
  let bg // default tile background = user accent color
  load()
  getSingletonThemeColor()

  function init(i) { id = i }
  function updateIcon() {
    update(id, render())
  }
  async function load() {
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      icon = await getFileInfo(fullPath)
      bg = colorToCssString(await getSingletonThemeColor())
    }
    catch (err) {
      icon = err
    }
    updateIcon()
  }
  function render() {
    let iconElement1
    if (!icon) { iconElement1 = throbber() }
    else if (icon instanceof Error) {
      iconElement1 = errorMessage(icon, 'preview')
    }
    else {
      let style
      if (props.bg) {
        style = `background-color: ${props.bg}`
      }
      else if (bg) {
        style = `background-color: ${bg}`
      }
      else {
        style = ''
      }
      iconElement1 = yo`
        <div>
          <div class="preview-box preview-box-medium" style=${style}>
            <div>
              <img src="data:image/png;base64,${icon.toString('base64')}"/>
            </div>
            <span>${shortcut.name}</span>
          </div>
          <div class="preview-box preview-box-small" style=${style}>
            <div>
              <img src="data:image/png;base64,${icon.toString('base64')}"/>
            </div>
          </div>
        </div>
      `
    }
    return yo`
      <div class="mui-panel">
        ${iconElement1}
      </div>
    `
  }

  props.on('update bg', () => update(id, render()))

  return connect(render, init)
}

function colorToCssString(color) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`
}

let themeColor

function getSingletonThemeColor() {
  if (themeColor) { return themeColor }
  themeColor = getThemeColor()
  return themeColor
}
