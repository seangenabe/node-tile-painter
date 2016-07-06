const yo = require('yo-yo')
const bumpFile = require('./util/bump-file')
const Path = require('path')

module.exports = function saver(shortcut, props) {

  async function save(e) {
    e.stopPropagation()
    let { vem } = props
    try {
      let fullPath = Path.join(shortcut.dir, shortcut.path)
      await vem.save(props)
      await bumpFile(fullPath)
      new Notification('Visual elements manifest saved.')
    }
    catch (err) {
      new Notification(
        'Error occured while saving visual elements manifest.',
        {
          body: err.message
        }
      )
    }
  }

  return yo`
    <div>
      <button type="button" class="mui-btn mui-btn--primary" onclick=${save}>Save</button>
    </div>
  `
}
