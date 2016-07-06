const relativeLuminance = require('./relative-luminance')

module.exports = function wcagContrast(colors) {
  let relativeLuminances = colors.map(relativeLuminance)
  relativeLuminances.sort()
  let [l2, l1] = relativeLuminances
  let contrastRatio = (l1 + 0.05) / (l2 + 0.05)
  return {
    l1,
    l2,
    contrastRatio,
    pass: contrastRatio >= 2
  }
}
