const FS = require('mz/fs')

module.exports = function bumpFile(path) {
  return FS.utimes(path, NaN, NaN)
}
