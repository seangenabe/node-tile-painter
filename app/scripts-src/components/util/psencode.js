// Encodes a string into a powershell expression.
module.exports = function(str) {
  let base64str = Buffer.from(str, 'utf16le').toString('base64')
  return `([System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String("${base64str}")))`
}
