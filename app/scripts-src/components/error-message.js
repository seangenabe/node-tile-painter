const yo = require('yo-yo')
const Util = require('util')

module.exports = (error, area) => {
  let errorHtml
  if (error instanceof Error) {
    errorHtml = error.stack
  }
  else {
    errorHtml = Util.inspect(error)
  }
  return yo`
    <div>
      <p>An error occurred in area: ${area}</p>
      <pre class="error-message-pre">${errorHtml}</pre>
    </div>
  `
}
