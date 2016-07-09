const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const errorMessage = require('./error-message')
const leafNode = require('./leaf-node')
const sortBy = require('lodash.sortby')

module.exports = function searchResults(shortcutUpdater, props) {
  let id

  function track(i) {
    id = i
    props.on('update shortcuts', upd)
    props.on('update q', upd)
  }

  function unload() {
    props.removeListener('update shortcuts', upd)
    props.removeListener('update q', upd)
  }

  function upd() {
    update(id, render())
  }

  function render() {
    let html
    let { shortcuts } = props
    if (Array.isArray(shortcuts)) {
      sortBy(shortcuts, s => s.name)
      html = shortcuts.map(
        shortcut => leafNode(shortcut, shortcutUpdater)
      )
    }
    else if (shortcuts instanceof Error) {
      html = errorMessage(shortcuts)
    }
    else {
      html = undefined
    }
    return yo`
      <div class="treeview-root">
        <ul>
          ${html}
        </ul>
      </div>
    `
  }

  return connect(render, track, null, null, unload)
}
