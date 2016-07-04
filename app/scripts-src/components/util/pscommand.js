const { exec } = require('child_process')
const commandJoin = require('command-join')

module.exports = function pscommand(command, inData) {
  let execCommand =
    commandJoin(['powershell.exe', '-Command', command])
  return new Promise((resolve, reject) => {
    exec(execCommand, (err, stdout, stderr) => {
      if (err) { return reject(err) }
      resolve(stdout.trim())
    })
  })
}
