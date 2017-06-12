const yo = require('yo-yo')
const flatten = require('lodash.flatten')
const Path = require('path')
const pscommand = require('./util/pscommand')
const createEventObject = require('./util/event-object')
const globby = require('globby')
const searchBox = require('./search-box')
const main = require('./shortcut-list-main')
const pify = require('pify')
const Temp = pify(require('temp').track())
const FS = require('mz/fs')
const psencode = require('./util/psencode')

module.exports = function shortcutList(shortcutUpdater) {
  let props = createEventObject()
  load()

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
      shortcutsArray = flatten(shortcutsArray)
      for (let shortcut of shortcutsArray) {
        let paths = shortcut.path.split('/')
        shortcut.paths = paths
        shortcut.filename = paths[paths.length - 1]
        shortcut.name = shortcut.filename.replace(/\.lnk$/, '')
      }
      props.shortcuts = shortcutsArray
    }
    catch (err) {
      props.shortcuts = err
    }
  }

  async function getShortcuts(programsDirectory, source) {
    let shortcuts = await globby(['**/*.lnk'], { cwd: programsDirectory })
    return shortcuts.map(s => ({
      dir: programsDirectory,
      path: s,
      source,
      fullPath: Path.join(programsDirectory, s)
    }))
  }

  return yo`
    <div>
      ${searchBox(props)}
      ${main(shortcutUpdater, props)}
    </div>
  `
}
