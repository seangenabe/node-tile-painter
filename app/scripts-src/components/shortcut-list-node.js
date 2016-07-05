const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)

module.exports = node
function node(item, shortcutUpdater) {
  if (item.isLeaf) { return leafNode(item, shortcutUpdater) }
  if (item.isRoot) { return treeRoot(item, shortcutUpdater) }
  return folderNode(item, shortcutUpdater)
}

function treeRoot(item, shortcutUpdater) {
  return yo`
    <div class="treeview-root">
      <ul>
        ${renderChildren(item.children, shortcutUpdater)}
      </ul>
    </div>
  `
}

function folderNode(item, shortcutUpdater) {
  let id
  function track(i) { id = i }
  function toggle(e) {
    item.expanded = !item.expanded
    update(id, render())
    e.stopPropagation()
  }
  function render() {
    return yo`
      <li>
        <strong class="treeview-folder ${
          item.expanded ? 'active' : ''
        }" onclick=${toggle}>${item.name}</strong>
        <ul ${item.expanded ? '' : 'hidden'}>
          ${renderChildren(item.children, shortcutUpdater)}
        </ul>
      </li>
    `
  }
  return connect(render, track)
}

function leafNode(item, shortcutUpdater) {
  function onleaf(e) {
    shortcutUpdater.selected = item.data
    shortcutUpdater.update()
    e.stopPropagation()
  }
  return yo`
    <li class="treeview-leaf" onclick=${onleaf}>${item.name}</li>
  `
}

function renderChildren(childrenMap, shortcutUpdater) {
  let values = Array.from(childrenMap.values())
  values.sort(childrenSort)
  return values.map(child => {
    return node(child, shortcutUpdater)
  })
}

function childrenSort(a, b) {
  let bSort = booleanSort(a.isLeaf, b.isLeaf)
  if (bSort !== 0) { return bSort }
  return stringSort(a.name, b.name)
}

function booleanSort(a, b) {
  if (a === b) { return 0 }
  if (!a) { return -1 }
  return 1
}

function stringSort(a, b) {
  if (a < b) { return -1 }
  return (a === b) ? 0 : 1
}
