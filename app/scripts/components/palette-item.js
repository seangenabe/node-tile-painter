const yo = require('yo-yo')

module.exports = function paletteItem(color, props) {
  function setcolor(e) {
    props.bg = color
    e.stopPropagation()
  }
  return yo`
    <button type="button" class="mui-btn" style=${`background-color: ${color}`} onclick=${setcolor}></button>
  `
}
