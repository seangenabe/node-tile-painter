const yo = require('yo-yo')
const treeList = require('./tree-list')
const searchResults = require('./search-results')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)

module.exports = function shortcutListMain(shortcutUpdater, props) {
  let id

  function track(i) {
    id = i
    props.on('update q', upd)
  }

  function unload() {
    props.removeListener('update q', upd)
  }

  function upd() {
    update(id, render())
  }

  function render() {
    return yo`
      <div>
        <div ${props.q ? 'hidden' : ''}>
          ${treeList(shortcutUpdater, props)}
        </div>
        <div ${props.q ? '' : 'hidden'}>
          ${searchResults(shortcutUpdater, props)}
        </div>
      </div>
    `
  }

  return connect(render, track, null, null, unload)
}
