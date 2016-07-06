const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const pify = require('pify')
const getPixels = pify(require('get-pixels'))
const getPalette = require('get-rgba-palette')
const rgbHex = require('rgb-hex')
const paletteItem = require('./palette-item')
const saver = require('./saver')
const contrastWarning = require('./contrast-warning')
const uploader = require('./uploader')

const DEFAULT_COLOR = "#000000"

module.exports = function editor(shortcut, props) {
  let id

  function track(i) {
    id = i
    props.on('update bg', onupdate)
    props.on('update icon', generatePaletteFromIcon)
    props.on('update palette', onupdate)
  }

  function unload() {
    props.removeListener('update bg', onupdate)
    props.removeListener('update icon', generatePaletteFromIcon)
    props.removeListener('update palette', onupdate)
  }

  function onupdate() {
    update(id, render())
  }

  async function generatePaletteFromIcon() {
    return await generatePalette(props.icon, 'image/png')
  }

  async function generatePalette(buffer, mime) {
    try {
      let pixels = await getPixels(buffer, mime)
      let palette = getPalette(pixels.data, 8)
      palette = palette.map(rgb => `#${rgbHex(...rgb)}`)
      props.palette = palette
    }
    catch (err) {
      props.palette = undefined
    }
  }

  function render() {
    let { bg, palette } = props
    let paletteElement
    if (palette) {
      paletteElement = palette.map(color => paletteItem(color, props))
    }
    else {
      paletteElement = undefined
    }
    return yo`
      <div class="mui-panel">
        <legend>Background</legend>
        <div>
          <input type="color" value=${bg ? bg : DEFAULT_COLOR} onchange=${changecolor}/>
          ${paletteElement}
        </div>
        <legend>Foreground</legend>
        <div class="mui-checkbox">
          <button type="button" class="mui-btn mui-btn--accent" onclick=${() => { props.showfg = false }} title="Do not show app name on tile">Hide</button>
          <button type="button" class="mui-btn" onclick=${() => { props.showfg = true; props.fg = 'light' }} title="Light foreground (for dark backgrounds)" style="background: #505050; color: white">Light</button>
          <button type="button" class="mui-btn" onclick=${() => { props.showfg = true; props.fg = 'dark' }} title="Dark foreground (for light backgrounds)" style="background: #c0c0c0">Dark</button>
        </div>
        <legend title="Replaces the icon and background with an image.">Add full-bleed image</legend>
        <div>
          ${uploader(props)}
        </div>
        ${contrastWarning(props)}
        ${saver(shortcut, props)}
      </div>
    `
  }

  function changecolor(e) {
    props.bg = e.target.value
    e.stopPropagation()
  }

  return connect(render, track, null, null, unload)
}
