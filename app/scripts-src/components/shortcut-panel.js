const yo = require('yo-yo')
const connect = require('throw-down/connect')
const properties = require('./properties')
const preview = require('./preview')
const { EventEmitter } = require('events')
const editor = require('./editor')

module.exports = shortcutPanel
function shortcutPanel(shortcut) {
  let id
  const props = new Proxy(new EventEmitter(), {
    set(target, key, value) {
      let oldValue = target[key]
      target[key] = value
      target.emit(`update ${key}`, value, oldValue)
      return true
    }
  })

  function init(_id) {
    id = _id
  }

  function render() {
    return yo`
      <div class="mui-container">
        <h3>Preview</h3>
        ${preview(shortcut, props)}
        <h3>Edit visual elements manifest</h3>
        ${editor(shortcut, props)}
        <h3>Properties</h3>
        ${properties(shortcut, props)}
      </div>
    `
  }

  return connect(render, init)
}
