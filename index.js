const electron = require('electron')
const { app } = electron

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// prevent window being garbage collected
let mainWindow

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null
}

function createMainWindow() {
  const w = new electron.BrowserWindow({
    width: 800,
    height: 600
  })

  w.loadURL(`file://${__dirname}/app/index.html`)
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
