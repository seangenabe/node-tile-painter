const yo = require('yo-yo')
const Util = require('util')

module.exports = shortcutPanel
function shortcutPanel(shortcut) {
  return yo`
    <div>
      Selected shortcut is ${Util.inspect(shortcut)}
    </div>
  `
}
