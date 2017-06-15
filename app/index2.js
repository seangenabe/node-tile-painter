const { app, remote } = require('electron')
const FS = require('mz/fs')
const updateProgramVem = require('./scripts/components/util/update-program-vem')

const args = remote.getGlobal('args')

;(async() => {
  const [vemPath, xmlPath, shortcutPath] = args._
  const xml = await FS.readFile(xmlPath)
  await updateProgramVem(vemPath, xml, shortcutPath)
  // Quit electron app.
  app.quit()
})()
