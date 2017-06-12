const yo = require('yo-yo')
const shortcutList = require('./shortcut-list')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const shortcutPanel = require('./shortcut-panel')

module.exports = function main() {
  let shortcutUpdater = { selected: undefined, update: () => {} }

  return yo`
    <div>
      <div id="sidedrawer">
        ${shortcutList(shortcutUpdater)}
      </div>
      <div id="content-wrapper">
        ${content(shortcutUpdater)}
      </div>
    </div>
  `
}

function content(shortcutUpdater) {
  let id

  function init(_id) { id = _id }

  function render() {
    let { selected } = shortcutUpdater
    let innerEl = selected ? shortcutPanel(selected) : undefined
    return yo`<div>${innerEl}</div>`
  }

  shortcutUpdater.update = function() {
    update(id, render())
  }

  return connect(render, init)
}
