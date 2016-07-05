const yo = require('yo-yo')
const connect = require('throw-down/connect')
const properties = require('./properties')
const preview = require('./preview')

module.exports = shortcutPanel
function shortcutPanel(shortcut) {
  let icon
  let id

  function init(_id) {
    id = _id
  }

  function render() {
    let base64icon
    return yo`
      <div class="mui-container">
        <h2>Preview</h2>
        ${preview(shortcut)}
        <h2>Properties</h2>
        ${properties(shortcut)}
      </div>
    `
  }

  return connect(render, init)
}
