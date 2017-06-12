module.exports = function relativeLuminance(channels) {
  channels = channels.map(toSRGB)
  if (channels[0] === channels[1] && channels[0] === channels[2]) {
    return channels[0]
  }
  channels = channels.map(c =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  )
  let [r, g, b] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function toSRGB(c) {
  return c / 255
}
