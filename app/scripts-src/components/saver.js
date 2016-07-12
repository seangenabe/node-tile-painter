const yo = require('yo-yo')
const Path = require('path')
const connect = require('throw-down/connect')
const update = require('throw-down/update')(yo.update)
const bumpFile = require('./util/bump-file')

module.exports = function saver(shortcut, props) {
  let id

  function track(i) {
    id = i
    props.on('update vem', upd)
  }

  function unload() {
    props.removeListener('update vem', upd)
  }

  async function save(e) {
    e.stopPropagation()
    let { vem } = props
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      await vem.save(props)
      new Notification('Visual elements manifest saved.')
    }
    catch (err) {
      console.error(err)
      new Notification(
        'Error occured while saving visual elements manifest.',
        {
          body: err.message
        }
      )
    }
  }

  async function del(e) {
    e.stopPropagation()
    let { vem } = props
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      await vem.remove(props)
      await bumpFile(fullPath)
      new Notification("Visual elements manifest deleted.")
    }
    catch (err) {
      console.error(err)
      new Notification(
        "Error occured while deleting visual elements manifest.",
        {
          body: err.message
        }
      )
    }
  }

  function upd() {
    update(id, render())
  }

  function render() {
    let { vem } = props
    let delTitle = "Remove customizations and delete visual elements manifest file."
    return yo`
      <div>
        <button type="button" class="mui-btn mui-btn--primary" onclick=${save} ${vem ? '' : 'disabled'}>Save</button>
        <button type="button" class="mui-btn mui-btn--danger" onclick=${del} ${vem ? '' : 'disabled'} title=${delTitle}>Delete</button>
      </div>
    `
  }

  return connect(render, track, null, null, unload)
}
