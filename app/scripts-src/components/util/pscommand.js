const { exec } = require('child_process')
const commandJoin = require('command-join')

module.exports = function pscommand(command) {
  let base64Command = Buffer.from(command, 'utf16le').toString('base64')
  let execCommand =
    commandJoin(['powershell.exe', '-EncodedCommand', base64Command])
  return new Promise((resolve, reject) => {
    exec(execCommand, (err, stdout, stderr) => {
      if (err) { return reject(err) }
      resolve(stdout.trim())
    })
  })
}
