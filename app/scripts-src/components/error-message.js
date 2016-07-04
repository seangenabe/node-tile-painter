const yo = require('yo-yo')

module.exports = (area, error) => yo`
  <div>
    <p>An error occurred in area: ${area}</p>
    <pre class="error-message-pre">${error.stack}</pre>
  </div>
`
