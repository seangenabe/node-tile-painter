const FS = require('@jokeyrhyme/pify-fs')
const pify = require('pify')
const Temp = pify(require('temp').track())
const pscommand = require('./pscommand')
const Elevator = require('elevator')

module.exports = async function autoElevateWrite(path, data, shortcutPath) {
  try {
    await FS.writeFile(path, data)
    return
  }
  catch (err) {
    if (err.code !== 'EPERM') { throw err }
  }
  // Copy data into temporary file (hopefully writable with current permissions)
  let info = await Temp.open('')
  await FS.writeFile(info.fd, data)
  let tmpPath = info.path

  // Copy temp file into destination with elevated permissions.
  let args = [
    'COPY', tmpPath, path
  ]
  if (shortcutPath) {
     ';', 'COPY', '/B', shortcutPath, '+,,'
  }
  await new Promise((resolve, reject) => {
    Elevator.execute(
      args,
      { waitForTermination: true, hidden: true, terminating: true },
      (err, stdout, stderr) => {
        if (err) {
          console.warn(`elevated cmd stderr: ${stderr}`)
          return reject(err)
        }
        resolve(stdout.trim())
      }
    )
  })
}
