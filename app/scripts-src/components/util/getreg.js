const pify = require('pify')
const Registry = require('winreg')

module.exports = async function(keyName, valueName) {
  // replace forward slashes with backslashes
  if (/\//.test(keyName)) {
    keyName = keyName.replace(/\//g, '\\')
  }
  let result = /([^\\]*)(.*)/.exec(keyName)
  let hive = result[1]
  let keyPath = result[2]
  let key = new Registry({
    hive: Registry[hive],
    key: keyPath
  })

  let items = await pify(key.values.bind(key))()

  if (!valueName) { return items }

  for (let item of items) {
    if (item.name === valueName) {
      return item
    }
  }
}
