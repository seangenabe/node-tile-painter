const FS = require('mz/fs')
const bumpFile = require('./bump-file')

async function updateProgramVem(vemPath, xml, shortcutPath) {
  await FS.writeFile(vemPath, xml)
  await bumpFile(shortcutPath)
}

module.exports = updateProgramVem

if (require.main === module) {
  (async () => {
    const [vemPath, xmlPath, shortcutPath] = process.argv.slice(2)
    const xml = await FS.readFile(xmlPath)
    updateProgramVem(vemPath, xml, shortcutPath)
  })()
}
