const yo = require('yo-yo')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)

module.exports = renderNode
function renderNode(item, shortcutUpdater) {
  let id

  function init(_id) {
    id = _id
  }

  function render() {
    if (item.isLeaf) {
      return yo`
        <li class="treeview-leaf" onclick=${onleaf}>${item.name}</li>
      `
    }
    if (item.isRoot) {
      return yo`
        <div class="treeview-root">
          <ul>
            ${renderChildren(item.children, shortcutUpdater)}
          </ul>
        </div>
      `
    }
    let childrenHtml = item.expanded ? yo`
      <ul>
        ${renderChildren(item.children, shortcutUpdater)}
      </ul>
    ` : undefined
    return yo`
      <li>
        <strong class="treeview-folder ${item.expanded ? 'active' : ''}" onclick=${toggle}>${item.name}</strong>
        ${childrenHtml}
      </li>
    `
  }

  function onleaf(e) {
    shortcutUpdater.selected = item.data
    shortcutUpdater.update()
    e.stopPropagation()
  }

  function toggle(e) {
    item.expanded = !item.expanded
    update(id, render())
    e.stopPropagation()
  }

  return connect(render, init)
}

function renderChildren(childrenMap, data, dataUpdate) {
  let values = Array.from(childrenMap.values())
  values.sort(childrenSort)
  return values.map(child => renderNode(child, data, dataUpdate))
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
