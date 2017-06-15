const electron = require('electron')
const { app } = electron
const minimist = require('minimist')
const updateProgramVem = require('update-program-vem')
const FS = require('mz/fs')

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')({ showDevTools: true, enabled: true })

// prevent window being garbage collected
let mainWindow

const args = minimist(process.argv.slice(1))
global.args = args

function createGui() {

  function onClosed() {
    // dereference the window
    // for multiple windows store them in an array
    mainWindow = null
  }

  function createMainWindow() {
    const w = new electron.BrowserWindow({
      width: 800,
      height: 600,
      icon: `${__dirname}/app/icon.ico`
    })

    w.loadURL(`file://${__dirname}/app/index${args.vem ? '2' : ''}.html`)
    w.on('closed', onClosed)

    //w.setMenu(null)

    return w
  }

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (!mainWindow) {
      mainWindow = createMainWindow()
    }
  })

  app.on('ready', () => {
    mainWindow = createMainWindow()
  })

}

if (args.vem) {
  (async() => {
    const [vemPath, xmlPath, shortcutPath] = args._
    const xml = await FS.readFile(xmlPath)
    await updateProgramVem(vemPath, xml, shortcutPath)
    // Quit electron app.
    app.quit()
  })()
}
else {
  createGui()
}

//createGui()
