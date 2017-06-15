const FS = require('mz/fs')
const bumpFile = require('bump-file')

async function updateProgramVem(vemPath, xml, shortcutPath) {
  await FS.writeFile(vemPath, xml)
  await bumpFile(shortcutPath)
}

module.exports = updateProgramVem
