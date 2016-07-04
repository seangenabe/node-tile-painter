module.exports = function expandVars(str) {
  return str.replace(/%([^%]*)%/g, (r, p1) => {
    let varValue = process.env[p1]
    return varValue ? varValue : r
  })
}
