const FS = require('@jokeyrhyme/pify-fs')

module.exports = function bumpFile(path) {
  return FS.utimes(path, NaN, NaN)
}
