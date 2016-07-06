const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const pify = require('pify')
const getPixels = pify(require('get-pixels'))
const getPalette = require('get-rgba-palette')
const rgbHex = require('rgb-hex')
const paletteItem = require('./palette-item')

const DEFAULT_COLOR = "#000000"

module.exports = function editor(shortcut, props) {
  let id

  function track(i) {
    id = i
    props.on('update bg', onupdate)
    props.on('update icon', generatePalette)
    props.on('update palette', onupdate)
  }

  function onremoved() {
    props.removeListener('update bg', onupdate)
    props.removeListener('update icon', generatePalette)
    props.removeListener('update palette', onupdate)
  }

  function onupdate() {
    update(id, render())
  }

  async function generatePalette() {
    try {
      let pixels = await getPixels(props.icon, 'image/png')
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
    let checked
    let hidden
    if (bg) {
      checked = 'checked'
      hidden = ''
    }
    else {
      checked = ''
      hidden = 'hidden'
    }
    let paletteElement
    if (palette) {
      paletteElement = palette.map(color => paletteItem(color, props))
    }
    else {
      paletteElement = undefined
    }
    return yo`
      <div class="mui-panel">
        <form>
          <legend>Background</legend>
          <div class="mui-checkbox">
            <input type="color" value=${bg ? bg : DEFAULT_COLOR} onchange=${changecolor} ${bg ? '' : 'disabled'}/>
            ${paletteElement}
            <button type="button" class="mui-btn" onclick=${clearcolor} title="Unset tile background color">Clear</button>
          </div>
        </form>
      </div>
    `
  }

  function togglecolor(e) {
    let { checked } = e.target
    if (checked) {
      props.bg = DEFAULT_COLOR
    }
    else {
      props.bg = undefined
    }
    e.stopPropagation()
  }

  function clearcolor(e) {
    props.bg = undefined
    e.stopPropagation()
  }

  function changecolor(e) {
    props.bg = e.target.value
    e.stopPropagation()
  }

  return connect(render, track, null, null, onremoved)
}
