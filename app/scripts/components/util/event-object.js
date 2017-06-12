const { EventEmitter } = require('events')

module.exports = function createEventObject() {
  return new Proxy(new EventEmitter(), {
    set(target, key, value) {
      let oldValue = target[key]
      target[key] = value
      target.emit(`update ${key}`, value, oldValue)
      return true
    }
  })
}
