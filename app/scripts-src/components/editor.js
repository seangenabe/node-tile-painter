const yo = require('yo-yo')
const connect = require('throw-down/connect')
const Util = require('util')
const update = require('throw-down/update')(yo.update)

const DEFAULT_COLOR = "#000000"

module.exports = function editor(shortcut, props) {
  let id

  function track(i) { id = i }

  function render() {
    let { bg } = props
    let checked
    if (bg) {
      checked = 'checked'
    }
    else {
      checked = ''
    }
    return yo`
      <div class="mui-panel">
        <pre>${Util.inspect(props)}</pre>
        <pre>${Util.inspect(bg)}</pre>
        <form>
          <legend>Background</legend>
          <div class="mui-checkbox">
            <label>
              <input type="checkbox" onchange=${togglecolor} ${checked}/>
              <span>Set a color: </span>
              <input type="color" value=${bg ? bg : DEFAULT_COLOR} onchange=${changecolor} ${bg ? '' : 'disabled'}/>
            </label>
          </div>
        </form>
      </div>
    `
  }

  function togglecolor(e) {
    let { checked } = e.target
    if (checked) {
      props.bg = DEFAULT_COLOR
    }
    else {
      props.bg = undefined
    }
    props.emit('update bg')
    update(id, render())
  }

  function changecolor(e) {
    props.bg = e.target.value
    props.emit('update bg')
    update(id, render())
  }

  return connect(render, track)
}
