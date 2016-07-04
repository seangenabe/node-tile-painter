const yo = require('yo-yo')
const getreg = require('./util/getreg')
const errorMessage = require('./error-message')
const flatten = require('lodash.flatten')
const globby = require('globby')
const expandVars = require('./util/expand-vars')
const getOrCreate = require('./util/get-or-create')
const shortcutListNode = require('./shortcut-list-node')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)

module.exports = function shortcutList(shortcutUpdater) {
  let id
  let errHtml
  let shortcuts
  load()

  function init(_id) {
    id = _id
  }

  async function load() {
    try {
      let parent = 'HKCU/Software/Microsoft/Windows/CurrentVersion/Explorer'
      let [programsDirectory, commonProgramsDirectory] =
        await Promise.all([
          getreg(`${parent}/User Shell Folders`, 'Programs'),
          getreg(`${parent}/Shell Folders`, 'Programs')
        ])
      programsDirectory = expandVars(programsDirectory.value)
      commonProgramsDirectory = commonProgramsDirectory.value
      let shortcutsArray = await Promise.all([
        getShortcuts(programsDirectory, 'user'),
        getShortcuts(commonProgramsDirectory, 'common')
      ])
      shortcutsArray.sort((a, b) => a.path - b.path)
      shortcuts = flatten(shortcutsArray)
      onload()
    }
    catch (err) {
      onload(err)
    }
  }

  function onload(err) {
    if (err) {
      shortcuts = []
      errHtml = errorMessage('shortcut list', err)
    }
    else {
      errHtml = undefined
    }
    update(id, render())
  }

  function render() {
    let shortcutsHtml
    if (Array.isArray(shortcuts)) {
      shortcutsHtml = renderTree()
    }
    else {
      shortcutsHtml = yo`<p>Loading...</p>`
    }
    return yo`<div>
      ${errHtml}
      ${shortcutsHtml}
    </div>`
  }

  async function getShortcuts(startMenuDirectory, data) {
    let shortcuts = await globby(['**/*.lnk'], { cwd: startMenuDirectory })
    return shortcuts.map(s => ({ dir: startMenuDirectory, path: s, data }))
  }

  function renderTree() {
    return shortcutListNode(createTree(), shortcutUpdater)
  }

  function createTree() {
    let treeRoot = { children: new Map(), isRoot: true }
    for (let shortcut of shortcuts) {
      let paths = shortcut.path.split('/')
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
      let shortcutName = paths[paths.length - 1].replace(/\.lnk$/, '')
      currentParent.children.set(
        shortcutName,
        { isLeaf: true, data: shortcut, name: shortcutName }
      )
    }
    return treeRoot
  }

  return connect(render, init)
}
