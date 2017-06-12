module.exports = function getOrCreate(map, key, factory) {
  if (map.has(key)) {
    return map.get(key)
  }
  let value = factory(key, map)
  map.set(key, value)
  return value
}
