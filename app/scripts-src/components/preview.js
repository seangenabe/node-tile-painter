const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const errorMessage = require('./error-message')
const Path = require('path')
const getFileInfo = require('./util/get-file-info')
const throbber = require('./throbber')
const getThemeColor = require('./util/get-theme-color')
const Util = require('util')

module.exports = shortcutPreview
function shortcutPreview(shortcut, props) {
  let icon // icon in png format
  let id
  let bg // default tile background = user accent color
  let pvbg = 0x50
  load()
  // fire singleton async retrieve theme color
  getSingletonThemeColor()

  function init(i) {
    id = i
    for (let name of ['bg', 'fg', 'showfg']) {
      props.on(`update ${name}`, upd)
    }
  }

  function unload() {
    for (let name of ['bg', 'fg', 'showfg']) {
      props.removeListener(`update ${name}`, upd)
    }
  }

  async function load() {
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      icon = await getFileInfo(fullPath)
      bg = colorToCssString(await getSingletonThemeColor())
      props.icon = icon
    }
    catch (err) {
      icon = err
    }
    upd()
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
      let name = Path.basename(shortcut.path, '.lnk')
      let fg = props.fg === 'light' ? 'white' : 'black'
      iconElement1 = yo`
        <div>
          <div class="preview-box preview-box-medium" style=${style}>
            <div>
              <img src="data:image/png;base64,${icon.toString('base64')}"/>
            </div>
            <span ${props.showfg ? '' : 'hidden'} style="color: ${fg}">${name}</span>
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
      <div class="mui-panel" style="background-color: rgb(${pvbg}, ${pvbg}, ${pvbg})">
        ${iconElement1}
        <input type="range" oninput=${changepvbg} min="0" max="255" value=${pvbg} style="width: 100%"/>
      </div>
    `
  }

  function changepvbg(e) {
    pvbg = e.target.value
    upd()
  }

  function upd() {
    update(id, render())
  }

  return connect(render, init, null, null, unload)
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
