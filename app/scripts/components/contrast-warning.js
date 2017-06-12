const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const hexRgb = require('hex-rgb')
const wcagContrast = require('./util/wcag-contrast')
const Util = require('util')

module.exports = function contrastWarning(props) {
  let id

  function track(i) {
    id = i
    for (let key of ['bg', 'showfg', 'fg']) {
      props.on(`update ${key}`, upd)
    }
  }

  function unload() {
    for (let key of ['bg', 'showfg', 'fg']) {
      props.removeListener(`update ${key}`, upd)
    }
  }

  function upd() {
    update(id, render())
  }

  function render() {
    let fg = props.fg === 'light' ? '#ffffff' : '#000000'
    let contrast = props.showfg && props.bg && props.fg &&
      wcagContrast([hexRgb(props.bg), hexRgb(fg)])
    let show = Boolean(contrast) && !contrast.pass
    let msg
    if (show) {
      msg = `${contrast.contrastRatio.toFixed(1)}:1`
    }
    return yo`<p ${show ? '' : 'hidden'} class="mui--text-accent">You might not be able to see the foreground against the background with these settings. Contrast ratio: ${msg}</p>`
  }

  return connect(render, track, null, null, unload)
}
