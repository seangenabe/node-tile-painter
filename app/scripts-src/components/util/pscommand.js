const { exec } = require('child_process')
const commandJoin = require('command-join')

module.exports = pscommand
function pscommand(command) {
  let base64Command = Buffer.from(command, 'utf16le').toString('base64')
  let execCommand =
    commandJoin(['powershell.exe', '-NoProfile', '-EncodedCommand', base64Command])
  return new Promise((resolve, reject) => {
    exec(execCommand, (err, stdout, stderr) => {
      if (err) {
        console.warn(`powershell stderr: ${stderr}`)
        return reject(err)
      }
      resolve(stdout.trim())
    })
  })
}
