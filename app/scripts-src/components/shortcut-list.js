const yo = require('yo-yo')
const errorMessage = require('./error-message')
const flatten = require('lodash.flatten')
const globby = require('globby')
const getOrCreate = require('./util/get-or-create')
const shortcutListNode = require('./shortcut-list-node')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const pscommand = require('./util/pscommand')
const Path = require('path')

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
      let [programsDirectory, commonProgramsDirectory] =
        await Promise.all([
          pscommand(`[Environment]::GetFolderPath('StartMenu')`),
          pscommand(`[Environment]::GetFolderPath('CommonStartMenu')`)
        ])
      programsDirectory = Path.join(programsDirectory, 'Programs')
      commonProgramsDirectory = Path.join(commonProgramsDirectory, 'Programs')
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
      shortcutsHtml = yo`<p class="loading">Loading...</p>`
    }
    return yo`<div>
      ${errHtml}
      ${shortcutsHtml}
    </div>`
  }

  async function getShortcuts(programsDirectory, source) {
    let shortcuts = await globby(['**/*.lnk'], { cwd: programsDirectory })
    return shortcuts.map(s => ({ dir: programsDirectory, path: s, source }))
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
      let shortcutFilename = paths[paths.length - 1]
      let shortcutName = shortcutFilename.replace(/\.lnk$/, '')
      currentParent.children.set(
        shortcutFilename,
        { isLeaf: true, data: shortcut, name: shortcutName }
      )
    }
    return treeRoot
  }

  return connect(render, init)
}
