const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const shortcutListNode = require('./shortcut-list-node')
const getOrCreate = require('./util/get-or-create')
const errorMessage = require('./error-message')

module.exports = function treeList(shortcutUpdater, props) {
  let id

  function track(i) {
    id = i
    props.on('update shortcuts', upd)
  }

  function unload() {
    props.removeListener('update shortcuts', upd)
  }

  function render() {
    let html
    if (Array.isArray(props.shortcuts)) {
      html = renderTree()
    }
    else if (props.shortcuts instanceof Error) {
      html = errorMessage(props.shortcuts)
    }
    else {
      html = yo`<div class="throbber"></div>`
    }
    return html
  }

  function renderTree() {
    return shortcutListNode(createTree(), shortcutUpdater)
  }

  function createTree() {
    let treeRoot = { children: new Map(), isRoot: true }
    for (let shortcut of props.shortcuts) {
      let paths = shortcut.paths
      console.log('shortcut', shortcut) // DEBUG
      let pathsWithoutFinal = paths.slice(0, -1)
      let currentParent = treeRoot
      for (let path of pathsWithoutFinal) {
        // create folder directory
        let folder = getOrCreate(
          currentParent.children,
          path,
          () => ({ children: new Map(), name: path })
        )
        currentParent = folder
      }
      currentParent.children.set(
        shortcut.filename,
        { isLeaf: true, data: shortcut }
      )
    }
    return treeRoot
  }

  function upd() {
    update(id, render())
  }

  return connect(render, track, null, null, unload)
}
