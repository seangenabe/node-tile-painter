const yo = require('yo-yo')

module.exports = function leafNode(shortcut, shortcutUpdater) {
  function onleaf(e) {
    shortcutUpdater.selected = shortcut
    shortcutUpdater.update()
    e.stopPropagation()
  }
  return yo`
    <li class="treeview-leaf" onclick=${onleaf}>${shortcut.name}</li>
  `
}
