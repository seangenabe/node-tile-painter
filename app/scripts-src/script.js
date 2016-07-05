const { remote } = require('electron')

require('muicss')
let root = document.getElementById('root')
let main = require('./components/main.js')

root.appendChild(main())

document.addEventListener('keydown', e => {
  if (e.which === 123) {
    remote.getCurrentWindow().toggleDevTools()
  }
  else if (e.which === 116) {
    location.reload()
  }
})
