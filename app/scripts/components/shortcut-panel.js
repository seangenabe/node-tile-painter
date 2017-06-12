const yo = require('yo-yo')
const connect = require('throw-down/connect')
const properties = require('./properties')
const preview = require('./preview')
const editor = require('./editor')
const createEventObject = require('./util/event-object')

module.exports = shortcutPanel
function shortcutPanel(shortcut) {
  const props = createEventObject()

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
